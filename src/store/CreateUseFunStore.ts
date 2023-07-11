// eslint-disable-next-line prettier/prettier
"use client";
import { Chain, ExecutionReceipt } from '@fun-xyz/core'
import { create } from 'zustand'

import { ConnectorArray } from '../connectors/Types'
import { ChainStoreInterface, handleChainSwitching } from './plugins/ChainStore'
import { buildAndUpdateConfig, ConfigureStoreInterface, setConfig } from './plugins/ConfigureStore'
import { ConnectorStoreInterface } from './plugins/ConnectorStore'
import { ErrorStoreInterface, FunError } from './plugins/ErrorStore'
import { configureFunAccountStore, FunAccountStoreInterface } from './plugins/FunAccountStore'
import { addNewTransaction, TransactionStoreState } from './plugins/TransactionStore'

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
      connectors: hookBuildParams.connectors,
      groupId: null,
      setGroupId: (groupId: string) => set(() => ({ groupId })),
      requiredActiveConnectors: 0,
      setRequiredActiveConnectors: (requiredActiveConnectors: number) => set(() => ({ requiredActiveConnectors })),
      // FunAccount Store
      ...configureFunAccountStore(hookBuildParams.defaultIndex, get, set),
      // CHAIN STORE
      chain: null,
      chainId: null,
      supportedChains: hookBuildParams.supportedChains,
      switchChain: async (chainId: number | string) => {
        const { config: oldConfig, account: oldAccount, FunWallet: funWallet } = get()
        const newState = await handleChainSwitching(chainId, oldConfig)
        set(newState)
        const newAccount = funWallet?.getAddress()
        if (oldAccount !== newAccount) {
          set({ account: newAccount })
        }
      },

      // CONFIG STORE
      config: null,
      updateConfig: async (newConfig: any) => {
        const oldConfig = get().config
        const update = await buildAndUpdateConfig(newConfig, oldConfig || {})
        return set(update)
      },
      setConfig: async (newConfig: any) => {
        return set(await setConfig(newConfig))
      },

      //TRANSACTION STORE
      transactions: [],
      lastTransaction: null,
      addTransaction: (newTransaction: ExecutionReceipt) => addNewTransaction(newTransaction, get, set),

      // ERROR STORE
      error: null,
      errors: [],
      txError: null,
      setFunError: (error: FunError) => {
        const { errors } = get()
        if (errors.length === 10) errors.pop()
        set({ error, errors: [error].concat(errors) })
      },
      setTempError: (error: FunError) => {
        const { errors } = get()
        if (errors.length === 10) errors.pop()
        set({ error, errors: [error].concat(errors) })
        setTimeout(() => set({ error: null }), 5000)
      },
      setTxError: (txError: FunError) => set({ txError }),
      resetFunError: () => set({ error: null }),
      resetFunErrors: () => set({ errors: [] }),
      resetTxError: () => set({ txError: null }),
      setAssets: (assets) => set({ assets }),
      assets: null,
    })
  )
}
