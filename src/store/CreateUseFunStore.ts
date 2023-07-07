// eslint-disable-next-line prettier/prettier
"use client";
import { Chain, Eoa, ExecutionReceipt, FunWallet } from '@fun-xyz/core'
import { create } from 'zustand'

import { ConnectorArray } from '../connectors/Types'
import { ChainStoreInterface, handleChainSwitching } from './plugins/ChainStore'
import { buildAndUpdateConfig, ConfigureStoreInterface, setConfig } from './plugins/ConfigureStore'
import { ConnectorStoreInterface } from './plugins/ConnectorStore'
import { ErrorStoreInterface, FunError } from './plugins/ErrorStore'
import { addNewTransaction, TransactionStoreState } from './plugins/TransactionStore'
export interface useFunStoreInterface
  extends ConnectorStoreInterface,
    ChainStoreInterface,
    ConfigureStoreInterface,
    TransactionStoreState,
    ErrorStoreInterface {
  index: number
  setIndex: (index: number) => void
  resetIndex: () => void
  FunWallet: FunWallet | null
  setFunWallet: (FunWallet: FunWallet) => void
  Eoa: Eoa | null
  setEoa: (Authorizer: Eoa) => void
  uniqueId: string | null
  setUniqueId: (uniqueId: string) => void
  account: string | null
  setAccount: (account: string) => void
  setLogin: (index: number, account: string, funWallet: FunWallet, eoa: Eoa, uniqueId: string) => void
  ensName: string | null
  setEnsName: (ensName: string) => void
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
      index: hookBuildParams.defaultIndex || 0,
      setIndex: (newIndex: number) => set({ index: newIndex }),
      resetIndex: () => set({ index: 0 }),
      FunWallet: null,
      setFunWallet: (FunWallet: FunWallet) => set({ FunWallet }),
      Eoa: null,
      setEoa: (Authorizer: Eoa) => set({ Eoa: Authorizer }),
      uniqueId: null,
      setUniqueId: (uniqueId: string) => set({ uniqueId }),
      account: null,
      setAccount: (account: string) => set({ account }),
      setLogin: (index: number, account: string, funWallet: FunWallet, Eoa: Eoa, uniqueId: string) => {
        set({ index, account, FunWallet: funWallet, Eoa, uniqueId })
      },
      ensName: null,
      setEnsName: (ensName: string) => set({ ensName }),
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
