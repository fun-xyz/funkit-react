import { EnvOption, ExecutionReceipt, Operation } from '@fun-xyz/core'
import { useCallback, useState } from 'react'

import {
  FunError,
  generateTransactionError,
  NoActiveUserError,
  TransactionErrorCatch,
  useFunStoreInterface,
} from '@/store'

import { useUserInfo } from '../account/UseUserInfo'
import { useFun } from '../UseFun'
import { usePrimaryAuth } from '../util'

export const useRBAC = () => {
  const { wallet, chainId } = useFun((state: useFunStoreInterface) => ({
    wallet: state.FunWallet,
    chainId: state.chainId,
  }))

  const primaryAuth = usePrimaryAuth()
  const { activeUser } = useUserInfo()

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ExecutionReceipt | Operation | null>(null)
  const [error, setTxError] = useState<FunError | null>(null)

  const addOwner = useCallback(
    async (newOwnerId: string, txOption?: EnvOption) => {
      if (wallet == null || !chainId || !primaryAuth) return
      if (activeUser == null) {
        setTxError(NoActiveUserError)
        return NoActiveUserError
      }
      if (loading) return

      try {
        const operation = await wallet.addOwner(
          primaryAuth[0],
          activeUser?.userId,
          { ownerId: newOwnerId as `0x${string}`, chainId },
          txOption
        )

        setResult(operation)
        setLoading(false)
        return operation
      } catch (error) {
        const err = generateTransactionError(TransactionErrorCatch, { newOwnerId }, error)
        setTxError(err)
        setLoading(false)
        return err
      }
    },
    [activeUser, chainId, loading, primaryAuth, wallet]
  )

  const removeOwner = useCallback(
    async (ownerId: string) => {
      if (wallet == null || !chainId || !primaryAuth) return
      if (activeUser == null) {
        setTxError(NoActiveUserError)
        return NoActiveUserError
      }
      if (loading) return

      try {
        const operation = await wallet.removeOwner(primaryAuth[0], activeUser?.userId, {
          ownerId: ownerId as `0x${string}`,
          chainId,
        })

        setResult(operation)
        setLoading(false)
        return operation
      } catch (error) {
        const err = generateTransactionError(TransactionErrorCatch, {}, error)
        setTxError(err)
        setLoading(false)
        return err
      }
    },
    [activeUser, chainId, loading, primaryAuth, wallet]
  )

  return { addOwner, removeOwner, loading, result, error }
}
