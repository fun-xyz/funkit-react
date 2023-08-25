import { Chain, FunWallet, FunWalletParams } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  FunError,
  generateTransactionError,
  MissingActiveSigner,
  MissingConfigError,
  MissingInitializationArgs,
} from '../../store'
import { useFun } from '../index'
import { usePrimaryAuth } from '../util'

export interface IInitializeFunAccount extends FunWalletParams {
  index?: number
}

export interface IInitializeMultiSigFunAccount {
  userIds: string[]
  threshold: number
  index?: number
}

/**
 * Custom hook that provides functionality to create a new Fun wallet account.
 * @returns An object containing the created Fun wallet account, the account address, the chain ID, any errors that occurred, a boolean indicating whether the account is being initialized, a function to reset any errors, and a function to initialize a new Fun wallet account.
 */
export const useCreateFun = () => {
  const {
    storedFunWallet,
    account,
    error,
    config,
    setLogin,
    setTempError,
    resetFunError,
    activeUser,
    allUsers,
    setNewAccountUsers,
  } = useFun(
    (state) => ({
      storedFunWallet: state.FunWallet,
      account: state.account,
      error: state.error,
      config: state.config,
      setLogin: state.setLogin,
      setTempError: state.setTempError,
      resetFunError: state.resetFunError,
      activeUser: state.activeUser,
      allUsers: state.allUsers,
      setNewAccountUsers: state.setNewAccountUsers,
    }),
    shallow
  )

  const [initializing, setInitializing] = useState(false)
  const [auth] = usePrimaryAuth()
  /**
   * Handles any errors that occur during the creation of a new Fun wallet account.
   * @param error The error that occurred.
   * @returns The error that occurred.
   */
  const handleBuildError = useCallback(
    (error: FunError) => {
      setTempError(error)
      setInitializing(false)
      return error
    },
    [setTempError, setInitializing]
  )

  /**
   * Initializes a new Fun wallet account.
   * @param args An object containing the parameters to initialize the Fun wallet account.
   * @returns The created Fun wallet account, any errors that occurred, or undefined if the account is already being initialized.
   */
  const initializeFunAccount = useCallback(
    async (args: IInitializeFunAccount | string): Promise<FunWallet | FunError | undefined> => {
      if (initializing) return
      if (auth == null) return handleBuildError(MissingActiveSigner)
      if (config == null || !config.chain) return handleBuildError(MissingConfigError)
      if (args == null) return handleBuildError(generateTransactionError(MissingInitializationArgs, args))
      try {
        let chainId = config.chain
        if (chainId instanceof Chain) {
          chainId = await chainId.getChainId()
        }

        // explicitly defined User array
        if (typeof args === 'string') {
          console.warn("WARNING: You're logging into an existing wallet without a uniqueId.")
          console.warn('WARNING: if the wallet has not been initialized it will throw errors.')

          const newFunWallet = new FunWallet(args)
          const account = await newFunWallet.getAddress()
          // if exists on chain and if it doesnt throw error if the uniqueID isnt also passed
          newFunWallet
            .getUsers(auth)
            .then((allUsers) => {
              setNewAccountUsers(allUsers, allUsers[0])
            })
            .catch()
          setLogin(account, newFunWallet)
          return newFunWallet
        }
        if (args.users) {
          const WALLET_UNIQUE_ID = await auth.getWalletUniqueId(args.index ?? 0)
          const newFunWallet = new FunWallet({
            users: args.users,
            uniqueId: WALLET_UNIQUE_ID,
          })
          const newAccountAddress = await newFunWallet.getAddress()
          newFunWallet
            .getUsers(auth)
            .then((allUsers) => {
              setNewAccountUsers(allUsers, allUsers[0])
            })
            .catch()

          setLogin(newAccountAddress, newFunWallet)
          return newFunWallet
        }
        // login to a specific fun wallet
        else if (args.uniqueId) {
          const newFunWallet = new FunWallet({ users: [{ userId: await auth.getUserId() }], uniqueId: args.uniqueId })
          const account = await newFunWallet.getAddress()
          // if exists on chain and if it doesnt throw error if the uniqueID isnt also passed
          newFunWallet
            .getUsers(auth)
            .then((allUsers) => {
              setNewAccountUsers(allUsers, allUsers[0])
            })
            .catch()
          setLogin(account, newFunWallet)
          return newFunWallet
        } else {
          // Default login as the primary auth
          const WALLET_UNIQUE_ID = await auth.getWalletUniqueId(args.index ?? 0)
          const newFunWallet = new FunWallet({
            users: [{ userId: await auth.getUserId() }],
            uniqueId: WALLET_UNIQUE_ID,
          })
          const newAccountAddress = await newFunWallet.getAddress()
          newFunWallet
            .getUsers(auth)
            .then((allUsers) => {
              setNewAccountUsers(allUsers, allUsers[0])
            })
            .catch()
          setLogin(newAccountAddress, newFunWallet)
          return newFunWallet
        }
      } catch (err) {
        console.log('Multi Signer Error: ', err)
        return handleBuildError({
          code: 0,
          message: 'Failed to configure account',
          err,
        })
      }
    },
    [initializing, auth, handleBuildError, config, setLogin, setNewAccountUsers]
  )

  return {
    funWallet: storedFunWallet,
    account,
    // chainId:
    //   config?.chain instanceof Chain ? config?.chain : Chain.getChain({ chainIdentifier: config?.chain.toString() }),
    error,
    loading: initializing,
    activeUser,
    allUsers,
    resetFunError,
    initializeFunAccount,
    // initializeFunMultiSigAccount,
  }
}
