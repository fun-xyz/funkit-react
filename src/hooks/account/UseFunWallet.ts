import { Auth, Chain, FunWallet, GlobalEnvOption, Wallet } from '@funkit/core'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  FunError,
  generateTransactionError,
  MissingActiveSigner,
  MissingConfigError,
  MissingInitializationArgs,
} from '../../store'
import { generateWalletUniqueId } from '../../utils'
import { FunLogger } from '../../utils/Logger'
import { useFun } from '../index'
import { usePrimaryAuth } from '../util'

const logger = new FunLogger()

interface useFunWalletHook {
  active: boolean
  activating: boolean
  wallet: FunWallet | null
  address: string | null
  createFunWallet: (auth: Auth, chainId?: number) => Promise<FunWallet | FunError | undefined>
  activateFunWallet: (walletInfo: Wallet, auth?: Auth) => Promise<FunWallet | FunError | undefined>
  deactivateFunWallet: () => void
}

/**
 * Custom hook that provides functionality to create a new Fun wallet account.
 * @returns An object containing the created Fun wallet account, the account address, the chain ID, any errors that occurred, a boolean indicating whether the account is being initialized, a function to reset any errors, and a function to initialize a new Fun wallet account.
 */
export const useFunWallet = (options?: GlobalEnvOption): useFunWalletHook => {
  const { storedFunWallet, account, config, setLogin, setNewAccountUsers, setFunGroupAccounts, updateConfig } = useFun(
    (state) => ({
      storedFunWallet: state.FunWallet,
      account: state.account,
      error: state.error,
      config: state.config,
      setLogin: state.setLogin,
      activeUser: state.activeUser,
      allUsers: state.allUsers,
      setNewAccountUsers: state.setNewAccountUsers,
      setFunGroupAccounts: state.setFunGroupAccounts,
      updateConfig: state.updateConfig,
    }),
    shallow
  )

  useEffect(() => {
    if (config == null && !options)
      throw new Error('Config not set. Either pass in a config object or set it using the useConfig hook.')
    if (config == null && options) updateConfig(options)
  }, [config, options, updateConfig])

  const [initializing, setInitializing] = useState(false)
  const [primaryAuth] = usePrimaryAuth()
  /**
   * Handles any errors that occur during the creation of a new Fun wallet account.
   * @param error The error that occurred.
   * @returns The error that occurred.
   */
  const handleBuildError = useCallback(
    (error: FunError) => {
      setInitializing(false)
      return error
    },
    [setInitializing]
  )

  /**
   * Initializes a new Fun wallet account.
   * @param args An object containing the parameters to initialize the Fun wallet account.
   * @returns The created Fun wallet account, any errors that occurred, or undefined if the account is already being initialized.
   */
  const activateFunWallet = useCallback(
    async (wallet: Wallet, auth?: Auth): Promise<FunWallet | FunError | undefined> => {
      if (initializing) return undefined
      const currentAuth = auth ?? primaryAuth
      if (currentAuth == null) return handleBuildError(MissingActiveSigner)

      if (config == null || !config.chain) return handleBuildError(MissingConfigError)
      if (wallet == null) return handleBuildError(generateTransactionError(MissingInitializationArgs, wallet))

      try {
        let chainId = config.chain
        if (chainId instanceof Chain) {
          chainId = await chainId.getChainId()
        }
        const usersIds = wallet.userIds.map((userId) => ({ userId }))
        const uniqueId = wallet.walletUniqueId //TODO make sure this cannot be undefined in the database which was an known bug
        if (usersIds.length === 0 || uniqueId == null) return handleBuildError(MissingInitializationArgs)

        const newFunWallet = new FunWallet({
          users: usersIds,
          uniqueId,
        })
        const newAccountAddress = await newFunWallet.getAddress()
        newFunWallet
          .getUsers(currentAuth)
          .then((allUsers) => {
            setNewAccountUsers(allUsers, allUsers[0])
          })
          .catch((err) => {
            logger.error('getUsers_error', err)
          })
        setLogin(newAccountAddress, newFunWallet)
        return newFunWallet
      } catch (err) {
        logger.log('Multi_Signer_Error: ', err)
        return handleBuildError({
          code: 0,
          message: 'Failed to configure account',
          err,
        })
      }
    },
    [initializing, primaryAuth, handleBuildError, config, setLogin, setNewAccountUsers]
  )

  const createFunWallet = useCallback(
    async (auth: Auth, chainId?: number): Promise<FunWallet | FunError | undefined> => {
      if (initializing) return undefined
      if (auth == null) return handleBuildError(MissingActiveSigner)
      if (config == null || !config.chain) return handleBuildError(MissingConfigError)
      try {
        if (chainId && config.chain !== chainId) updateConfig({ chain: chainId })
        const walletUniqueId = await generateWalletUniqueId(auth)
        const userId = await auth.getUserId()
        const newFunWallet = new FunWallet({
          users: [{ userId }],
          uniqueId: walletUniqueId,
        })
        const newAccountAddress = await newFunWallet.getAddress()
        await newFunWallet.saveWalletToAuth(auth)
        auth
          .getWallets(chainId ? `${chainId}` : undefined)
          .then((newWalletsArray) => {
            setFunGroupAccounts(newWalletsArray)
          })
          .catch((err) => {
            // caught the error without crashing the function
            logger.error('post create wallets fetch err: ', err)
          })
        setNewAccountUsers([{ userId }], { userId })
        setLogin(newAccountAddress, newFunWallet)

        return newFunWallet
      } catch (err) {
        return handleBuildError({
          code: 0,
          message: 'Failed to create account',
          err,
        })
      }
    },
    [config, handleBuildError, initializing, setFunGroupAccounts, setLogin, setNewAccountUsers, updateConfig]
  )

  const deactivateFunWallet = () => {
    setLogin('', null)
  }

  return {
    active: storedFunWallet != null,
    activating: initializing,
    wallet: storedFunWallet,
    address: account,
    createFunWallet,
    activateFunWallet,
    deactivateFunWallet,
  }
}
