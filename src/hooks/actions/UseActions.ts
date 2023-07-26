import { Auth, EnvOption, Operation } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { ExecutionReceipt, useFunStoreInterface } from '../..'
import { FunError, generateTransactionError, TransactionErrorCatch } from '../../store'
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

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ExecutionReceipt | Operation | null>(null)
  const [error, setTxError] = useState<FunError | null>(null)

  const executeNewOperation = useCallback(
    async (auth?: Auth) => {
      if (loading) return
      if (wallet == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        const userId = await firstSigner.getUserId()
        console.log('action launching ', args, args.action, userId, args.params)
        const Operation = await wallet[args.action](firstSigner, userId, args.params as any, txOptions)
        setResult(Operation)
        setLoading(false)
        // wallet
        //   .executeOperation(firstSigner, Operation, txOptions)
        //   .then((receipt) => {
        //     setResult(receipt)
        //     setLoading(false)
        //   })
        //   .catch((err) => {
        //     // TODO: handle error since its likely unable to execute the transaction
        //     setResult(Operation)
        //     setLoading(false)
        //   })

        // check if there are any other signers which could sign the transaction to execute it fully
      } catch (error) {
        console.log('actionError', error)
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
      }
    },
    [args, primaryAuth, loading, txOptions, wallet]
  )

  return {
    loading,
    result,
    error,
    executeOperation: executeNewOperation,
  }
}
