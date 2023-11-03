// eslint-disable-next-line prettier/prettier
"use client";
import { createWithEqualityFn } from 'zustand/traditional'

import { withErrorLogging } from '../utils/Logger'
import { ChainStoreInterface, configureChainStore } from './plugins/ChainStore'
import { configureConfigurationStore, ConfigureStoreInterface } from './plugins/ConfigureStore'
import { configureErrorStore, ErrorStoreInterface } from './plugins/ErrorStore'
import { configureFunAccountStore, FunAccountStoreInterface } from './plugins/FunAccountStore'
import { configureAuthStore, IFunAuthStore } from './plugins/FunAuthStore'
import { configureTransactionStore, TransactionStoreState } from './plugins/OperationsStore'

export interface useFunStoreInterface
  extends FunAccountStoreInterface,
    IFunAuthStore,
    ChainStoreInterface,
    ConfigureStoreInterface,
    TransactionStoreState,
    ErrorStoreInterface {
  setAssets: (assets: object) => void
  assets: object | null
}

export const createUseFunStore = () => {
  return withErrorLogging(() => {
    return createWithEqualityFn((set: any, get: any): useFunStoreInterface => {
      // Substores
      const funAccountStore = configureFunAccountStore(get, set)
      const authStore = configureAuthStore(get, set)
      const chainStore = configureChainStore(get, set)
      const configStore = configureConfigurationStore(get, set)
      const txnStore = configureTransactionStore(get, set)
      const errorStore = configureErrorStore(get, set)

      // Build the full store:
      // 1. Declaratively list out all substore variables instead of spreading
      // to guard against same-name variables being declared across different stores
      // which would cause overriding and make things hard to maintain / debug.
      // 2. Typecast to `useFunStoreInterface` to ensure no necessary variables are missed.
      const fullStore: useFunStoreInterface = {
        // Fun Account Store
        FunWallet: funAccountStore.FunWallet,
        setFunWallet: funAccountStore.setFunWallet,
        account: funAccountStore.account,
        setAccount: funAccountStore.setAccount,
        setLogin: funAccountStore.setLogin,
        ensName: funAccountStore.ensName,
        setEnsName: funAccountStore.setEnsName,

        // Auth Store
        activeAuthClients: authStore.activeAuthClients,
        setActiveAuthClients: authStore.setActiveAuthClients,
        activeClientSubscriber: authStore.activeClientSubscriber,
        setActiveClientSubscriber: authStore.setActiveClientSubscriber,
        FunGroupAccounts: authStore.FunGroupAccounts,
        setFunGroupAccounts: authStore.setFunGroupAccounts,
        FunAccounts: authStore.FunAccounts,
        setFunAccounts: authStore.setFunAccounts,
        activeUser: authStore.activeUser,
        setActiveUser: authStore.setActiveUser,
        allUsers: authStore.allUsers,
        setAllUsers: authStore.setAllUsers,
        setNewAccountUsers: authStore.setNewAccountUsers,

        // Chain Store
        chain: chainStore.chain,
        chainId: chainStore.chainId,
        supportedChains: chainStore.supportedChains,
        setSupportedChains: chainStore.setSupportedChains,
        switchChain: chainStore.switchChain,

        // Configuration Store
        config: configStore.config,
        updateConfig: configStore.updateConfig,
        setConfig: configStore.setConfig,

        // Txn Store
        transactions: txnStore.transactions,
        lastTransaction: txnStore.lastTransaction,
        addTransaction: txnStore.addTransaction,
        operations: txnStore.operations,
        addOperation: txnStore.addOperation,

        // Error Store
        error: errorStore.error,
        errors: errorStore.errors,
        txError: errorStore.txError,
        setFunError: errorStore.setFunError,
        setTempError: errorStore.setTempError,
        setTxError: errorStore.setTxError,
        resetFunError: errorStore.resetFunError,
        resetFunErrors: errorStore.resetFunErrors,
        resetTxError: errorStore.resetTxError,

        // Misc
        setAssets: (assets) => set({ assets }),
        assets: null,
      }

      return fullStore as useFunStoreInterface
    })
  })
}
