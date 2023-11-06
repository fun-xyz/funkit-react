// @ts-nocheck
import {
  AddUserToGroupParams,
  Auth,
  CreateGroupParams,
  EnvOption,
  Operation,
  RemoveUserFromGroupParams,
  UpdateThresholdOfGroupParams,
} from '@funkit/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { FunLogger } from '@/utils/Logger'

import { ExecutionReceipt, useFunStoreInterface, useUserInfo } from '../..'
import { FunError, generateTransactionError, TransactionErrorCatch } from '../../store'
import { remainingConnectedSignersForOperation, signUntilExecute } from '../../utils/transactions/Transactions'
import { useFun } from '../UseFun'
import { useActiveClients, usePrimaryAuth } from '../util'

const logger = new FunLogger()

export const useGroup = () => {
  const { wallet } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
    }),
    shallow
  )
  const activeClients = useActiveClients()
  const primaryAuth = usePrimaryAuth()
  const { activeUser, fetchUsers } = useUserInfo()

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ExecutionReceipt | Operation | null>(null)
  const [error, setTxError] = useState<FunError | null>(null)

  const createGroup = useCallback(
    async (userId: string, params: CreateGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return
      setLoading(true)
      try {
        const Operation = await wallet.createGroup(firstSigner, userId, params as any, txOptions)
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation: Operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })
        if (remainingConnectedSigners.length === 0) {
          const [receipt] = await Promise.all([
            wallet.executeOperation(firstSigner, Operation, txOptions),
            fetchUsers(),
          ])
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner,
          operation: Operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      } finally {
        setLoading(false)
      }
    },
    [activeClients, activeUser, fetchUsers, loading, primaryAuth, wallet]
  )

  const removeGroup = useCallback(
    async (userId: string, params: RemoveUserFromGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return
      setLoading(true)
      try {
        const Operation = await wallet.removeGroup(firstSigner, userId, params as any, txOptions)
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation: Operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })
        if (remainingConnectedSigners.length === 0) {
          const [receipt] = await Promise.all([
            wallet.executeOperation(firstSigner, Operation, txOptions),
            fetchUsers(),
          ])
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner,
          operation: Operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      } finally {
        setLoading(false)
      }
    },
    [activeClients, activeUser, fetchUsers, loading, primaryAuth, wallet]
  )

  const addUserToGroup = useCallback(
    async (userId: string, params: AddUserToGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return
      setLoading(true)
      try {
        const Operation = await wallet.addUserToGroup(firstSigner, userId, params as any, txOptions)
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation: Operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })
        if (remainingConnectedSigners.length === 0) {
          const [receipt] = await Promise.all([
            wallet.executeOperation(firstSigner, Operation, txOptions),
            fetchUsers(),
          ])
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner,
          operation: Operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      } finally {
        setLoading(false)
      }
    },
    [activeClients, activeUser, fetchUsers, loading, primaryAuth, wallet]
  )

  const removeUserFromGroup = useCallback(
    async (userId: string, params: RemoveUserFromGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return
      setLoading(true)
      try {
        const Operation = await wallet.removeUserFromGroup(firstSigner, userId, params as any, txOptions)
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation: Operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })
        if (remainingConnectedSigners.length === 0) {
          const [receipt] = await Promise.all([
            wallet.executeOperation(firstSigner, Operation, txOptions),
            fetchUsers(),
          ])
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner,
          operation: Operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        logger.error('removeUserFromGroup_error', error)
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      } finally {
        setLoading(false)
      }
    },
    [activeClients, activeUser, fetchUsers, loading, primaryAuth, wallet]
  )

  const updateThresholdOfGroup = useCallback(
    async (userId: string, params: UpdateThresholdOfGroupParams, auth?: Auth, txOptions?: EnvOption) => {
      if (loading) return
      if (wallet == null) return
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return
      setLoading(true)
      try {
        const Operation = await wallet.updateThresholdOfGroup(firstSigner, userId, params as any, txOptions)
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation: Operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })
        if (remainingConnectedSigners.length === 0) {
          const [receipt] = await Promise.all([
            wallet.executeOperation(firstSigner, Operation, txOptions),
            fetchUsers(),
          ])
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner,
          operation: Operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        logger.error('updateThresholdOfGroup_error', error)
        setTxError(generateTransactionError(TransactionErrorCatch, { userId, params }, error))
        return generateTransactionError(TransactionErrorCatch, { userId, params }, error)
      } finally {
        setLoading(false)
      }
    },
    [activeClients, activeUser, fetchUsers, loading, primaryAuth, wallet]
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
