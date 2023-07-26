import { Auth, EnvOption, Operation, OperationStatus } from '@fun-xyz/core'
import { useCallback, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  generateTransactionError,
  TransactionErrorFailedToExecute,
  TransactionErrorFailedToSign,
  TransactionErrorMissingOpId,
  TransactionErrorNonGroupTransaction,
  TransactionErrorRejectionOperation,
  useFunStoreInterface,
} from '../../store'
import { useOperationStatus } from '../data/UseOperationStatus'
import { useFun } from '../UseFun'

export interface IUseOperationReturn {
  operations: Operation[]
  pendingApproval: Operation[]
  loading: boolean
  fetchOperations: () => void
  signOperation: (operation: Operation) => void
  executeOperation: (operation: Operation) => void
  rejectOperation: (operation: Operation) => void
  removeOperation: (operation: Operation) => void
}

export const useOperations = () => {
  const { wallet } = useFun((state: useFunStoreInterface) => ({ wallet: state.FunWallet }), shallow)
  const { operations, loading, fetchOperations } = useOperationStatus()

  const [processing, setProcessing] = useState<boolean>(false)

  const pendingApproval = useMemo(
    () => operations.filter((operation) => operation.status === OperationStatus.PENDING_APPROVED),
    [operations]
  )

  const signOperation = useCallback(
    async (operation: Operation, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      setProcessing(true)
      try {
        const signedOperation = await wallet.signOperation(auth, operation, txOption)
        setProcessing(false)
        return signedOperation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorFailedToSign, { operation }, err)
      }
    },
    [wallet]
  )

  const executeOperation = useCallback(
    async (operation: Operation, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      setProcessing(true)
      try {
        const Operation = await wallet.executeOperation(auth, operation, txOption)
        setProcessing(false)
        return Operation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorFailedToExecute, { operation }, err)
      }
    },
    [wallet]
  )

  const rejectOperation = useCallback(
    async (operation: Operation, rejectionMessage: string, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      if (operation.groupId == null) return generateTransactionError(TransactionErrorNonGroupTransaction, { operation })
      setProcessing(true)
      try {
        const rejectedOperation = await wallet.createRejectOperation(
          auth,
          operation.groupId,
          operation,
          rejectionMessage,
          txOption
        )
        setProcessing(false)
        return rejectedOperation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorRejectionOperation, { operation }, err)
      }
    },
    [wallet]
  )

  const removeOperation = useCallback(
    async (operation: Operation, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      if (operation.opId == null) return generateTransactionError(TransactionErrorMissingOpId, { operation })
      setProcessing(true)
      try {
        const removedOperation = await wallet.removeOperation(auth, operation.opId, txOption)
        setProcessing(false)
        return removedOperation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorRejectionOperation, { operation }, err)
      }
    },
    [wallet]
  )

  return {
    operations,
    pendingApproval,
    loading,
    processing,
    fetchOperations,
    signOperation,
    executeOperation,
    rejectOperation,
    removeOperation,
  }
}
