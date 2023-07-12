// eslint-disable-next-line prettier/prettier
"use client";
import { Chain } from '@fun-xyz/core'
import { create } from 'zustand'

import { ConnectorArray } from '../connectors/Types'
import { ChainStoreInterface, configureChainStore } from './plugins/ChainStore'
import { configureConfigurationStore, ConfigureStoreInterface } from './plugins/ConfigureStore'
import { configureConnectorStore, ConnectorStoreInterface } from './plugins/ConnectorStore'
import { configureErrorStore, ErrorStoreInterface } from './plugins/ErrorStore'
import { configureFunAccountStore, FunAccountStoreInterface } from './plugins/FunAccountStore'
import { configureTransactionStore, TransactionStoreState } from './plugins/TransactionStore'

export interface useFunStoreInterface
  extends FunAccountStoreInterface,
    ConnectorStoreInterface,
    ChainStoreInterface,
    ConfigureStoreInterface,
    TransactionStoreState,
    ErrorStoreInterface {
  setAssets: (assets: object) => void
  assets: object | null
}

export interface createUseFunInterface {
  connectors: ConnectorArray
  supportedChains: Chain[]
  defaultIndex?: number
  connectEagerly?: boolean
}

export const createUseFunStore = (hookBuildParams: createUseFunInterface) => {
  return create(
    (set: any, get: any): useFunStoreInterface => ({
      ...configureConnectorStore(hookBuildParams.connectors, get, set),
      // FunAccount Store
      ...configureFunAccountStore(hookBuildParams.defaultIndex, get, set),
      // CHAIN STORE
      ...configureChainStore(hookBuildParams.supportedChains, get, set),
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
