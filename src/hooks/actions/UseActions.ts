import { Auth, EnvOption, Operation } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { ExecutionReceipt, useFunStoreInterface, useUserInfo } from '../..'
import { FunError, generateTransactionError, TransactionErrorCatch } from '../../store'
import { useFun } from '../UseFun'
import { usePrimaryAuth } from '../util'
import { FirstClassActionParams } from './types'

export const useAction = (args: FirstClassActionParams, txOptions?: EnvOption) => {
  // if (typeof args.action == ActionType.){}

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
      console.log('executeNewOperation', auth, primaryAuth, wallet, activeUser, loading)
      if (loading) return
      if (wallet == null || activeUser == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        console.log('action launching ', args, args.action, activeUser, args.params, firstSigner, activeUser)
        console.log('ACTION: ', firstSigner, primaryAuth)
        const operation: Operation = await wallet[args.action](
          firstSigner,
          activeUser.userId,
          args.params as any,
          txOptions
        )

        console.log('operation', operation, operation.signatures)
        // check if the active User is a group or has a threshold of 1 and therefor can be executed right away
        console.log('activeUser.groupInfo', activeUser.groupInfo)
        if (activeUser.groupInfo == null || activeUser.groupInfo.threshold === 1) {
          // if there is no group execute the transaction right away
          const receipt = await wallet.executeOperation(firstSigner, operation, txOptions)
          console.log('executed right away', receipt)
          setResult(receipt)
          setLoading(false)
          return receipt
        } else {
          let count = 1
          // for each active auth sign the Operation or if we achieve the threshold execute the transaction
          // starts at 1 since the priary auth signed already
          for (let i = 1; i < primaryAuth.length; i++) {
            const currentAuth = primaryAuth[i]
            console.log('checking if we sign or execute', count, activeUser.groupInfo.threshold)

            if (count + 1 >= activeUser.groupInfo.threshold) {
              console.log('executing operation', operation)
              const receipt = await wallet.executeOperation(currentAuth, operation, txOptions)
              console.log('executed operation', receipt)
              setResult(receipt)
              setLoading(false)
              return receipt
            } else {
              console.log('signing operation', operation)
              wallet
                .signOperation(currentAuth, operation, txOptions)
                .then(() => {
                  count++
                })
                .catch((err) => {
                  // we want to catch issues here because they may have rejected the signature on purpose
                  console.log('error signing operation', err)
                })
            }
          }
          setResult(operation)
          setLoading(false)
          return operation
        }

        // check if there are any other signers which could sign the transaction to execute it fully
      } catch (error: any) {
        console.log('actionError', error, error.code)

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
    loading,
    result,
    error,
    executeOperation: executeNewOperation,
  }
}
