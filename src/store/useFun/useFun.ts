// eslint-disable-next-line prettier/prettier
"use client";
import { Connector } from '@web3-react/types'
import { Eoa, FunWallet } from 'fun-wallet'
import { Chain } from 'fun-wallet'
import { create } from 'zustand'

import { ConnectorArray } from '../../connectors/Connector'
import { ChainStoreInterface, handleChainSwitching } from '../chainStore'
import { buildAndUpdateConfig, ConfigureStoreInterface, setConfig } from '../configureStore'
import { ConnectorStoreInterface } from '../connectorStore'
import { ErrorStoreInterface, FunError } from '../errorStore'

export interface useFunStoreInterface
  extends ConnectorStoreInterface,
    ChainStoreInterface,
    ConfigureStoreInterface,
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
}

export interface createUseFunInterface {
  connectors: ConnectorArray
  supportedChains: Chain[]
  defaultIndex?: number
  connectEagerly?: boolean
}

export const createUseFun = (hookBuildParams: createUseFunInterface) => {
  return create(
    (set: any): useFunStoreInterface => ({
      connectors: hookBuildParams.connectors,
      groupId: null,
      setGroupId: (groupId: string) => set(() => ({ groupId })),
      requiredActiveConnectors: 0,
      setRequiredActiveConnectors: (requiredActiveConnectors: number) => set(() => ({ requiredActiveConnectors })),
      activeConnectors: [],
      setActiveConnectors: (activeConnectors: Connector[]) => set(() => ({ activeConnectors })),
      updateActiveConnectors: (activeConnectors: Connector[]) =>
        set((state: useFunStoreInterface) => {
          const newActiveConnectors = [...state.activeConnectors, ...activeConnectors]
          return { activeConnectors: newActiveConnectors }
        }),
      index: hookBuildParams.defaultIndex || 0,

      setIndex: (newIndex: number) => set(() => ({ index: newIndex })),
      resetIndex: () => set({ index: 0 }),
      FunWallet: null,
      setFunWallet: (FunWallet: FunWallet) => set(() => ({ FunWallet })),
      Eoa: null,
      setEoa: (Authorizer: Eoa) => set(() => ({ Eoa: Authorizer })),
      uniqueId: null,
      setUniqueId: (uniqueId: string) => set(() => ({ uniqueId })),
      account: null,
      setAccount: (account: string) => set(() => ({ account })),
      setLogin: (index: number, account: string, funWallet: FunWallet, Eoa: Eoa, uniqueId: string) => {
        set(() => ({ index, account, FunWallet: funWallet, Eoa, uniqueId }))
      },
      ensName: null,
      setEnsName: (ensName: string) => set(() => ({ ensName })),
      chain: null,
      chainId: null,
      supportedChainIds: hookBuildParams.supportedChains,
      switchChain: (chainId: number) =>
        set(async ({ config }: useFunStoreInterface) => {
          return await handleChainSwitching(chainId, config)
        }),
      config: null,
      updateConfig: (newConfig: any) => {
        return set(async (state: useFunStoreInterface) => {
          return await buildAndUpdateConfig(newConfig, state.config || {})
        })
      },
      setConfig: (newConfig: any) => {
        return set(async () => {
          return await setConfig(newConfig)
        })
      },
      error: null,
      errors: [],
      setFunError: (error: FunError) => set((state) => ({ error, errors: state.errors.concat([error]) })),
      resetFunError: () => set({ error: null }),
      resetFunErrors: () => set({ errors: [] }),
    })
    // persist(
    //     ,
    //     {
    //         name: "fun-web-cache",
    //         storage: createJSONStorage(() => sessionStorage)
    //     }
    // )
  )
}
