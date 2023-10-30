// eslint-disable-next-line prettier/prettier
"use client";
import { createWithEqualityFn } from 'zustand/traditional'

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
  return createWithEqualityFn(
    (set: any, get: any): useFunStoreInterface => ({
      ...configureFunAccountStore(get, set),
      ...configureAuthStore(get, set),
      ...configureChainStore(get, set),
      ...configureConfigurationStore(get, set),
      ...configureTransactionStore(get, set),
      ...configureErrorStore(get, set),
      setAssets: (assets) => set({ assets }),
      assets: null,
    })
  )
}
