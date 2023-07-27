import { Auth, Operation } from '@fun-xyz/core'
import { CreateGroupParams } from '@fun-xyz/core'
import { EnvOption } from '@fun-xyz/core'
import { AddUserToGroupParams } from '@fun-xyz/core'
import { RemoveUserFromGroupParams } from '@fun-xyz/core'
import { UpdateThresholdOfGroupParams } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { ExecutionReceipt, useFunStoreInterface } from '../..'
import { FunError, generateTransactionError, TransactionErrorCatch } from '../../store'
import { useFun } from '../UseFun'
import { usePrimaryAuth } from '../util'

export const useGroup = () => {
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

  const createGroup = useCallback(
    async (userId: string, params: CreateGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        const Operation = await wallet.createGroup(firstSigner, userId, params as any, txOptions)
        setResult(Operation)
        setLoading(false)
        return Operation
      } catch (error) {
        console.log('[createGroup Error] ', error)
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      }
    },
    [loading, primaryAuth, wallet]
  )

  const addUserToGroup = useCallback(
    async (userId: string, params: AddUserToGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        const Operation = await wallet.addUserToGroup(firstSigner, userId, params as any, txOptions)
        setResult(Operation)
        setLoading(false)
        return Operation
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      }
    },
    []
  )

  const removeUserFromGroup = useCallback(
    async (userId: string, params: RemoveUserFromGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        const Operation = await wallet.removeUserFromGroup(firstSigner, userId, params as any, txOptions)
        setResult(Operation)
        setLoading(false)
        return Operation
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      }
    },
    [loading, primaryAuth, wallet]
  )

  const updateThresholdOfGroup = useCallback(
    async (userId: string, params: UpdateThresholdOfGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        const Operation = await wallet.updateThresholdOfGroup(firstSigner, userId, params as any, txOptions)
        setResult(Operation)
        setLoading(false)
        return Operation
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      }
    },
    []
  )

  const removeGroup = useCallback(
    async (userId: string, params: RemoveUserFromGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return // invalid tx params error
      const firstSigner = auth ?? primaryAuth
      if (firstSigner == null) return // no signer error
      setLoading(true)
      try {
        const Operation = await wallet.removeGroup(firstSigner, userId, params as any, txOptions)
        setResult(Operation)
        setLoading(false)
        return Operation
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      }
    },
    [loading, primaryAuth, wallet]
  )

  return {
    loading,
    result,
    error,
    createGroup,
    addUserToGroup,
    removeUserFromGroup,
    updateThresholdOfGroup,
    removeGroup,
  }
}
