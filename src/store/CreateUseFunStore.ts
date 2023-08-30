// eslint-disable-next-line prettier/prettier
"use client";
import { create } from 'zustand'

import { ChainStoreInterface, configureChainStore } from './plugins/ChainStore'
import { configureConfigurationStore, ConfigureStoreInterface } from './plugins/ConfigureStore'
import { configureConnectorStore, ConnectorStoreInterface } from './plugins/ConnectorStore'
import { configureErrorStore, ErrorStoreInterface } from './plugins/ErrorStore'
import { configureFunAccountStore, FunAccountStoreInterface } from './plugins/FunAccountStore'
import { configureAuthStore, IFunAuthStore } from './plugins/FunAuthStore'
import { configureTransactionStore, TransactionStoreState } from './plugins/OperationsStore'

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

export const createUseFunStore = () => {
  return create(
    (set: any, get: any): useFunStoreInterface => ({
      ...configureConnectorStore(get, set),
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
