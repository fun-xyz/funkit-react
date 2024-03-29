import { Auth, EnvOption, Operation, OperationStatus } from '@funkit/core'
import { useCallback, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  generateTransactionError,
  TransactionErrorFailedToExecute,
  TransactionErrorFailedToSign,
  TransactionErrorMissingOpId,
  TransactionErrorNonGroupTransaction,
  TransactionErrorNotPending,
  TransactionErrorRejectionOperation,
  TransactionErrorRequiresSigners,
  TransactionErrorUnableToReject,
  TransactionErrorUserIdMismatch,
  useFunStoreInterface,
} from '../../store'
import { logger } from '../../utils/Logger'
import { convertToValidUserId } from '../../utils/MultiAuth'
import { remainingConnectedSignersForOperation, signUntilExecute } from '../../utils/transactions/Transactions'
import { useUserInfo } from '../account/UseUserInfo'
import { useOperationStatus } from '../data/UseOperationStatus'
import { useFun } from '../UseFun'
import { useActiveClients, usePrimaryAuth } from '../util'

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
  const primaryAuth = usePrimaryAuth()
  const { activeUser } = useUserInfo()
  const activeClients = useActiveClients()
  const [processing, setProcessing] = useState<boolean>(false)

  const pendingApproval = useMemo(
    () => operations.filter((operation) => operation.status === OperationStatus.PENDING_APPROVED),
    [operations]
  )

  const signOperation = useCallback(
    async (operation: Operation, auth?: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      if (primaryAuth == null)
        return generateTransactionError(TransactionErrorFailedToSign, {
          operation,
        })
      if (activeUser == null)
        return generateTransactionError(TransactionErrorFailedToSign, {
          operation,
        })
      if (operation.groupId !== activeUser.userId)
        return generateTransactionError(TransactionErrorUserIdMismatch, {
          operation,
          activeUser,
        })
      if (operation.status !== OperationStatus.PENDING_APPROVED)
        return generateTransactionError(TransactionErrorNotPending, {
          operation,
          activeUser,
        })

      const { remainingConnectedSigners } = remainingConnectedSignersForOperation({
        operation,
        activeUser,
        activeClients,
        firstSigner: null,
      })

      if (remainingConnectedSigners.length === 0)
        return generateTransactionError(TransactionErrorRequiresSigners, {
          operation,
        })
      const signer = auth ? auth : remainingConnectedSigners[0]?.auth
      if (signer == null)
        return generateTransactionError(TransactionErrorRequiresSigners, {
          operation,
        })

      setProcessing(true)
      try {
        const signedOperation = await wallet.signOperation(signer, operation, txOption)
        setProcessing(false)
        fetchOperations().catch((err) => {
          logger.error('signOperation_fetchOperations_error', err)
        })
        return signedOperation
      } catch (err) {
        logger.error('UseOperations_signOperation_error', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorFailedToSign, { operation }, err)
      }
    },
    [activeClients, activeUser, fetchOperations, primaryAuth, wallet]
  )

  const executeOperation = useCallback(
    async (operation: Operation, auth?: Auth, txOption?: EnvOption) => {
      if (wallet == null || activeUser == null) return
      if (processing) return
      if (operation.status !== OperationStatus.PENDING_APPROVED && operation.status !== OperationStatus.APPROVED)
        return generateTransactionError(TransactionErrorNotPending, {
          operation,
          activeUser,
        })

      if (operation.groupId == null) {
        if (convertToValidUserId(operation.proposer) !== convertToValidUserId(activeUser.userId))
          return generateTransactionError(TransactionErrorUserIdMismatch, {
            operation,
            activeUser,
          })
        const signer = auth ? auth : primaryAuth[0]
        const Operation = await wallet.executeOperation(signer, operation, txOption)
        setProcessing(false)
        fetchOperations().catch((err) => {
          logger.error('executeOperation_fetchOperations_1_error', err)
        })
        return Operation
      }
      if (operation.groupId !== activeUser.userId)
        return generateTransactionError(TransactionErrorUserIdMismatch, {
          operation,
          activeUser,
        })

      const { remainingConnectedSigners, signerCount, threshold } = remainingConnectedSignersForOperation({
        operation,
        activeUser,
        activeClients,
        firstSigner: null,
      })
      logger.log('remainingConnectedSigners', { remainingConnectedSigners, signerCount, threshold })
      if (remainingConnectedSigners.length === 0 && signerCount < threshold)
        return generateTransactionError(TransactionErrorRequiresSigners, {
          operation,
        })

      if (threshold - signerCount > 1)
        return generateTransactionError(TransactionErrorRequiresSigners, {
          operation,
        })

      const signer = auth ? auth : remainingConnectedSigners[0]?.auth ?? primaryAuth[0]
      if (signer == null)
        return generateTransactionError(TransactionErrorFailedToSign, {
          operation,
        })
      setProcessing(true)
      try {
        const Operation = await wallet.executeOperation(signer, operation, txOption)
        fetchOperations().catch((err) => {
          logger.error('executeOperation_fetchOperations_2_error', err)
        })
        return Operation
      } catch (err) {
        logger.error('UseOperations_executeOperation_error', err)
        return generateTransactionError(TransactionErrorFailedToExecute, { operation }, err)
      } finally {
        setProcessing(false)
      }
    },
    [activeClients, activeUser, fetchOperations, primaryAuth, processing, wallet]
  )

  const rejectOperation = useCallback(
    async (operation: Operation, rejectionMessage: string, auth?: Auth, txOptions?: EnvOption) => {
      if (wallet == null || activeUser == null || processing) return
      if (operation.groupId == null)
        return generateTransactionError(TransactionErrorNonGroupTransaction, {
          operation,
        })
      if (operation.status !== OperationStatus.PENDING_APPROVED && operation.status !== OperationStatus.APPROVED)
        return generateTransactionError(TransactionErrorUnableToReject, {
          operation,
          activeUser,
        })
      if (operation.groupId !== activeUser.userId)
        return generateTransactionError(TransactionErrorUserIdMismatch, {
          operation,
          activeUser,
        })

      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null)
        return generateTransactionError(TransactionErrorFailedToSign, {
          operation,
          auth,
          primaryAuth,
        })
      setProcessing(true)
      try {
        const rejectedOperation = await wallet.createRejectOperation(
          firstSigner,
          operation.groupId,
          operation,
          rejectionMessage,
          txOptions
        )
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })
        if (remainingConnectedSigners.length > 0) {
          await signUntilExecute({
            wallet,
            remainingConnectedSigners,
            threshold,
            operation,
            firstSigner,
            txOptions,
          })
        }
        fetchOperations().catch((err) => {
          logger.error('rejectOperation_fetchOperations_error', err)
        })
        return rejectedOperation
      } catch (err) {
        logger.error('UseOperations_rejectOperation_error', err, { operation, rejectionMessage, auth, txOptions })
        return generateTransactionError(TransactionErrorRejectionOperation, { operation }, err)
      } finally {
        setProcessing(false)
      }
    },
    [activeClients, activeUser, fetchOperations, primaryAuth, processing, wallet]
  )

  const removeOperation = useCallback(
    async (operation: Operation, auth?: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      if (operation.opId == null)
        return generateTransactionError(TransactionErrorMissingOpId, {
          operation,
        })
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null)
        return generateTransactionError(TransactionErrorFailedToSign, {
          operation,
          auth,
          primaryAuth,
        })
      setProcessing(true)
      try {
        const removedOperation = await wallet.removeOperation(firstSigner, operation.opId, txOption)
        setProcessing(false)
        fetchOperations().catch((err) => {
          logger.error('removeOperation_fetchOperations_error', err)
        })
        return removedOperation
      } catch (err) {
        logger.error('UseOperations_removeOperation_error', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorRejectionOperation, { operation }, err)
      }
    },
    [fetchOperations, primaryAuth, wallet]
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
