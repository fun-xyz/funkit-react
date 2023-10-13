import { Auth, EnvOption, Operation } from '@funkit/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { ExecutionReceipt, useFunStoreInterface, useUserInfo } from '../..'
import { FunError, generateTransactionError, MissingActiveSigner, TransactionErrorCatch } from '../../store'
import { useFun } from '../UseFun'
import { usePrimaryAuth } from '../util'
import { FirstClassActionParams } from './types'

export const useAction = (args: FirstClassActionParams, txOptions?: EnvOption) => {
  const { wallet } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
    }),
    shallow
  )
  const primaryAuth = usePrimaryAuth()

  const { activeUser } = useUserInfo()
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ExecutionReceipt | Operation | null>(null)
  const [error, setTxError] = useState<FunError | null>(null)

  const executeNewOperation = useCallback(
    async (auth?: Auth) => {
      if (loading) return
      if (wallet == null || (activeUser == null && primaryAuth[0] == null))
        return generateTransactionError(MissingActiveSigner, { activeUser })
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null)
        return generateTransactionError(MissingActiveSigner, {
          activeUser,
          primaryAuth,
          auth,
        })
      setLoading(true)
      try {
        const ActiveUser = activeUser ?? {
          userId: await firstSigner.getUserId(),
        }
        const operation: Operation = await wallet[args.action](
          firstSigner,
          ActiveUser.userId,
          args.params as any,
          txOptions
        )
        if (ActiveUser.groupInfo == null || ActiveUser.groupInfo.threshold === 1) {
          const receipt = await wallet.executeOperation(firstSigner, operation, txOptions)
          setResult(receipt)
          setLoading(false)
          return receipt
        } else {
          let count = 1
          for (let i = 1; i < primaryAuth.length; i++) {
            const currentAuth = primaryAuth[i]
            if (count + 1 >= ActiveUser.groupInfo.threshold) {
              const receipt = await wallet.executeOperation(currentAuth, operation, txOptions)
              setResult(receipt)
              setLoading(false)
              return receipt
            } else {
              await wallet
                .signOperation(currentAuth, operation, txOptions)
                .then(() => {
                  count++
                })
                .catch((err) => {
                  console.log('error signing operation', err)
                })
            }
          }
          setResult(operation)
          setLoading(false)
          return operation
        }
      } catch (error: any) {
        console.log(error)

        setTxError(
          generateTransactionError(
            TransactionErrorCatch,
            {
              args,
            },
            error
          )
        )
        setLoading(false)
        return generateTransactionError(
          TransactionErrorCatch,
          {
            args,
          },
          error
        )
      }
    },
    [loading, wallet, activeUser, primaryAuth, args, txOptions]
  )

  return {
    ready: wallet != null && primaryAuth != null && primaryAuth.length > 0,
    loading,
    result,
    error,
    executeOperation: executeNewOperation,
  }
}
