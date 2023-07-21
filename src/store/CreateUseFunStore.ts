// eslint-disable-next-line prettier/prettier
"use client";
import { create } from 'zustand'

import { ChainStoreInterface, configureChainStore } from './plugins/ChainStore'
import { configureConfigurationStore, ConfigureStoreInterface } from './plugins/ConfigureStore'
import { configureConnectorStore, ConnectorStoreInterface } from './plugins/ConnectorStore'
import { configureErrorStore, ErrorStoreInterface } from './plugins/ErrorStore'
import { configureFunAccountStore, FunAccountStoreInterface } from './plugins/FunAccountStore'
import { configureAuthStore, IFunAuthStore } from './plugins/FunAuthStore'
import { configureTransactionStore, TransactionStoreState } from './plugins/TransactionStore'

export interface useFunStoreInterface
  extends FunAccountStoreInterface,
    IFunAuthStore,
    ConnectorStoreInterface,
    ChainStoreInterface,
    ConfigureStoreInterface,
    TransactionStoreState,
    ErrorStoreInterface {
  setAssets: (assets: object) => void
  assets: object | null
}

export interface createUseFunInterface {
  defaultIndex?: number
  connectEagerly?: boolean
}

export const createUseFunStore = (hookBuildParams: createUseFunInterface) => {
  return create(
    (set: any, get: any): useFunStoreInterface => ({
      ...configureConnectorStore(get, set),
      // FunAccount Store
      ...configureFunAccountStore(get, set),
      // FunAuth Store
      ...configureAuthStore(get, set),
      // CHAIN STORE
      ...configureChainStore(get, set),
      // CONFIG STORE
      ...configureConfigurationStore(get, set),
      //TRANSACTION STORE
      ...configureTransactionStore(get, set),
      // ERROR STORE
      ...configureErrorStore(get, set),
      // Asset Store
      setAssets: (assets) => set({ assets }),
      assets: null,
    })
  )
}
