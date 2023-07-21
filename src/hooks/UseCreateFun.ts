import { Chain, FunWallet, FunWalletParams } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  FunError,
  generateTransactionError,
  MissingActiveSigner,
  MissingConfigError,
  MissingInitializationArgs,
} from '../store'
import { useFun } from './index'

export interface initializeFunAccount extends FunWalletParams {
  index?: number
}



/**
 * Custom hook that provides functionality to create a new Fun wallet account.
 * @returns An object containing the created Fun wallet account, the account address, the chain ID, any errors that occurred, a boolean indicating whether the account is being initialized, a function to reset any errors, and a function to initialize a new Fun wallet account.
 */
export const useCreateFun = () => {
  const { auth, storedFunWallet, account, error, config, setLogin, setTempError, resetFunError } = useFun(
    (state) => ({
      auth: state.Auth,
      storedFunWallet: state.FunWallet,
      account: state.account,
      error: state.error,
      config: state.config,
      setLogin: state.setLogin,
      setTempError: state.setTempError,
      resetFunError: state.resetFunError,
    }),
    shallow
  )

  const [initializing, setInitializing] = useState(false)

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
    async (args: initializeFunAccount): Promise<FunWallet | FunError | undefined> => {
      if (initializing) return
      if (auth == null) return handleBuildError(MissingActiveSigner)
      if (config == null || !config.chain) return handleBuildError(MissingConfigError)
      if (args.walletAddr == null && args.users == null)
        return handleBuildError(generateTransactionError(MissingInitializationArgs, args))
      try {
        if (args.users) {
          let chainId = config.chain
          if (chainId instanceof Chain) {
            chainId = await chainId.getChainId()
          }
          const WALLET_UNIQUE_ID = await auth.getWalletUniqueId(chainId.toString(), args.index ?? 0)
          const newFunWallet = new FunWallet({
            users: args.users,
            uniqueId: WALLET_UNIQUE_ID,
          })
          const newAccountAddress = await newFunWallet.getAddress()
          setLogin(newAccountAddress, newFunWallet)
          return newFunWallet
        }

        const newFunWallet = new FunWallet({ walletAddr: args.walletAddr })
        const account = await newFunWallet.getAddress()
        setLogin(account, newFunWallet)
        return newFunWallet
      } catch (err) {
        console.log('Multi Signer Error: ', err)
        return handleBuildError({
          code: 0,
          message: 'Failed to configure account',
          err,
        })
      }
    },
    [auth, config, handleBuildError, initializing, setLogin]
  )

  return {
    funWallet: storedFunWallet,
    account,
    chainId: config?.chain instanceof Chain ? config?.chain : new Chain({ chainId: config?.chain.toString() }),
    error,
    loading: initializing,
    resetFunError,
    initializeFunAccount,
  }
}
