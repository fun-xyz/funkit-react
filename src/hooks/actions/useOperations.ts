import { Auth, EnvOption, Operation, OperationStatus, User } from '@fun-xyz/core'
import { useCallback, useMemo, useState } from 'react'
import { pad } from 'viem'
import { shallow } from 'zustand/shallow'

import {
  generateTransactionError,
  TransactionErrorFailedToExecute,
  TransactionErrorFailedToSign,
  TransactionErrorMissingOpId,
  TransactionErrorNonGroupTransaction,
  TransactionErrorRejectionOperation,
  TransactionErrorRequiresSigners,
  TransactionErrorUserIdMismatch,
  useFunStoreInterface,
} from '../../store'
import { useUserInfo } from '../account/UseUserInfo'
import { useOperationStatus } from '../data/UseOperationStatus'
import { useFun } from '../UseFun'
import { useActiveClients, usePrimaryAuth } from '../util'

export const remainingConnectedSignersForOperation = (operation: Operation, activeUser: User, activeClients) => {
  const currentClients = activeClients.filter((client) => client.userId != null)
  const currentSigners = operation.signatures
  if (currentSigners == null || currentSigners.length == 0) return { remainingConnectedSigners: [], threshold: 0 }
  console.log('currentSigners precheck', currentSigners, currentClients, activeUser)
  const remainingConnectedSigners = currentClients
    .map(({ userId, provider }) => {
      const isRequiredSignature = activeUser.groupInfo?.memberIds.includes(userId)
      console.log('is userId required', userId, isRequiredSignature)
      if (!isRequiredSignature) return undefined
      const foundSignature = currentSigners.find((signer) => pad(signer.userId, { size: 32 }) === userId)
      console.log('foundSignature', foundSignature)
      if (foundSignature == null) {
        return { userId, provider }
      } else {
        return undefined
      }
    })
    .filter((signer) => signer != null)
  return { remainingConnectedSigners, threshold: activeUser.groupInfo?.threshold }
}
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

  // this should check what signers need to still sign and try and sign with one of those or throw a Fun Error
  const signOperation = useCallback(
    async (operation: Operation, auth?: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      if (primaryAuth == null) return generateTransactionError(TransactionErrorFailedToSign, { operation })
      if (activeUser == null) return generateTransactionError(TransactionErrorFailedToSign, { operation })
      // check what signers need to still sign and try and sign with one of those or throw a Fun Error

      const { remainingConnectedSigners } = remainingConnectedSignersForOperation(operation, activeUser, activeClients)

      if (remainingConnectedSigners.length === 0)
        return generateTransactionError(TransactionErrorFailedToSign, { operation })

      const signer = auth ? auth : new Auth({ provider: remainingConnectedSigners[0].provider })
      if (signer == null) return generateTransactionError(TransactionErrorFailedToSign, { operation })
      setProcessing(true)
      try {
        const signedOperation = await wallet.signOperation(signer, operation, txOption)
        setProcessing(false)
        fetchOperations()
        return signedOperation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorFailedToSign, { operation }, err)
      }
    },
    [activeClients, activeUser, fetchOperations, primaryAuth, wallet]
  )

  /// should check if the group Operation and ready to be signed once and executed
  // should check if the group Operation userId matches the current active user
  const executeOperation = useCallback(
    async (operation: Operation, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null || activeUser == null) return
      if (processing) return // don't allow it to return an error if its already processing
      if (operation.groupId == null) {
        // if its not a group transaction than check if the auth matches the operation userId and try and execute it
        if (pad(operation.proposer as `0x${string}`, { size: 32 }) !== activeUser.userId)
          return generateTransactionError(TransactionErrorUserIdMismatch, { operation, activeUser })
        const signer = auth ? auth : primaryAuth[0]
        const Operation = await wallet.executeOperation(signer, operation, txOption)
        setProcessing(false)
        fetchOperations()
        return Operation
      }
      if (operation.groupId !== activeUser.userId)
        return generateTransactionError(TransactionErrorUserIdMismatch, { operation, activeUser })

      const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation(
        operation,
        activeUser,
        activeClients
      )
      if (remainingConnectedSigners.length === 0 || remainingConnectedSigners.length < (threshold ?? 1))
        return generateTransactionError(TransactionErrorRequiresSigners, { operation })

      const signer = auth ? auth : new Auth({ provider: remainingConnectedSigners[0].provider })
      if (signer == null) return generateTransactionError(TransactionErrorFailedToSign, { operation })
      console.log('executeOperation', operation, signer)
      setProcessing(true)
      try {
        const Operation = await wallet.executeOperation(signer, operation, txOption)
        setProcessing(false)
        fetchOperations()
        return Operation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorFailedToExecute, { operation }, err)
      }
    },
    [activeClients, activeUser, fetchOperations, processing, wallet]
  )

  const SignAndExecute = useCallback(
    async (operation: Operation, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null || activeUser == null) return
      const firstSigner = auth ?? primaryAuth[0]
      if (firstSigner == null) return // no signer error
      if (processing) return
      console.log('executeOperation', operation, firstSigner)
      setProcessing(true)
      try {
        const Operation = await wallet.executeOperation(firstSigner, operation, txOption)
        setProcessing(false)
        fetchOperations()
        return Operation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorFailedToExecute, { operation }, err)
      }
    },
    [activeUser, fetchOperations, primaryAuth, processing, wallet]
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
        fetchOperations()
        return rejectedOperation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err, operation, rejectionMessage, auth, txOption)
        setProcessing(false)
        return generateTransactionError(TransactionErrorRejectionOperation, { operation }, err)
      }
    },
    [fetchOperations, wallet]
  )

  const removeOperation = useCallback(
    async (operation: Operation, auth: Auth, txOption?: EnvOption) => {
      if (wallet == null) return
      if (operation.opId == null) return generateTransactionError(TransactionErrorMissingOpId, { operation })
      setProcessing(true)
      try {
        const removedOperation = await wallet.removeOperation(auth, operation.opId, txOption)
        setProcessing(false)
        fetchOperations()
        return removedOperation
      } catch (err) {
        console.log('[useOperations ERROR] failed to sign operation', err)
        setProcessing(false)
        return generateTransactionError(TransactionErrorRejectionOperation, { operation }, err)
      }
    },
    [fetchOperations, wallet]
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
