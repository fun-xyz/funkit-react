import { EnvOption, ExecutionReceipt, Operation, User } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  FunError,
  generateTransactionError,
  NoActiveUserError,
  TransactionErrorCatch,
  useFunStoreInterface,
} from '../../store'
import { convertToValidUserId } from '../../utils'
import { remainingConnectedSignersForOperation, signUntilExecute } from '../../utils/transactions/Transactions'
import { useUserInfo } from '../account/UseUserInfo'
import { useFun } from '../UseFun'
import { useActiveClients, usePrimaryAuth } from '../util'

export const useRBAC = () => {
  const { wallet, chainId } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
      chainId: state.chainId,
    }),
    shallow
  )

  const primaryAuth = usePrimaryAuth()
  const activeClients = useActiveClients()
  const { activeUser, setActiveUser, setAllUsers } = useUserInfo()

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ExecutionReceipt | Operation | null>(null)
  const [error, setTxError] = useState<FunError | null>(null)

  const fetchAllWalletUsers = useCallback(
    async (setNewActive = false) => {
      if (wallet == null || primaryAuth[0] == null) return
      console.log('FETCHING ALL WALLET USERS RBAC: ', primaryAuth[0])
      wallet.getUsers(primaryAuth[0]).then((users: User[]) => {
        if (users && users.length > 0) {
          setAllUsers(users)
          if (setNewActive) setActiveUser(users[0])
        }
      })
    },
    [primaryAuth, setActiveUser, setAllUsers, wallet]
  )
  const addOwner = useCallback(
    async (newOwnerId: string, txOptions?: EnvOption) => {
      if (wallet == null || !chainId || !primaryAuth) return
      if (activeUser == null) {
        setTxError(NoActiveUserError)
        return NoActiveUserError
      }
      if (loading) return

      try {
        console.log('ADDING NEW OWNER: ', primaryAuth[0], activeUser, {
          ownerId: convertToValidUserId(newOwnerId) as `0x${string}`,
          chainId,
        })
        const operation = await wallet.addOwner(
          primaryAuth[0],
          activeUser?.userId,
          { ownerId: convertToValidUserId(newOwnerId) as `0x${string}`, chainId },
          txOptions
        )
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })

        if (remainingConnectedSigners.length === 0) {
          const receipt = await wallet.executeOperation(primaryAuth[0], operation, txOptions)
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner: primaryAuth[0],
          operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        console.log(error)
        const err = generateTransactionError(TransactionErrorCatch, { newOwnerId }, error)
        setTxError(err)
        return err
      } finally {
        setLoading(false)
        fetchAllWalletUsers()
      }
    },
    [activeClients, activeUser, chainId, fetchAllWalletUsers, loading, primaryAuth, wallet]
  )

  const removeOwner = useCallback(
    async (ownerId: string, txOptions?: EnvOption) => {
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
        const { remainingConnectedSigners, threshold } = remainingConnectedSignersForOperation({
          operation,
          activeUser,
          activeClients,
          firstSigner: null,
        })

        if (remainingConnectedSigners.length === 0) {
          const receipt = await wallet.executeOperation(primaryAuth[0], operation, txOptions)
          setResult(receipt)
          return receipt
        }
        const response = await signUntilExecute({
          firstSigner: primaryAuth[0],
          operation,
          remainingConnectedSigners,
          threshold,
          wallet,
          txOptions,
        })
        setResult(response)
        return response
      } catch (error) {
        const err = generateTransactionError(TransactionErrorCatch, { ownerId }, error)
        setTxError(err)
        return err
      } finally {
        setLoading(false)
      }
    },
    [activeClients, activeUser, chainId, loading, primaryAuth, wallet]
  )

  return { addOwner, removeOwner, loading, result, error }
}
