import { Eoa, FunWallet } from "fun-wallet";
import { configureEnvironment } from "fun-wallet/dist/src/config";
import { Chain } from "fun-wallet/dist/src/data";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ChainStoreInterface, handleChainSwitching } from "../chainStore";
import { ConfigureStoreInterface } from "../configureStore";
import { ConnectorStoreInterface } from "../connectorStore";
import type { Web3ReactHooks } from "@web3-react/core";
import type { Connector, Web3ReactStore } from "@web3-react/types";

export interface useFunStoreInterface
  extends ConnectorStoreInterface,
    ChainStoreInterface,
    ConfigureStoreInterface {
  index: number;
  setIndex: (index: number) => void;
  resetIndex: () => void;
  FunWallet: FunWallet | null;
  setFunWallet: (FunWallet: FunWallet) => void;
  Authorizer: Eoa | null;
  setAuthorizer: (Authorizer: Eoa) => void;
  uniqueId: string | null;
  setUniqueId: (uniqueId: string) => void;
  account: string | null;
  setAccount: (account: string) => void;
  ensName: string | null;
  setEnsName: (ensName: string) => void;
}

export interface createUseFunInterface {
  connectors:
    | [Connector, Web3ReactHooks][]
    | [Connector, Web3ReactHooks, Web3ReactStore][];
  supportedChains: Chain[];
  defaultIndex?: number;
  connectEagerly?: boolean;
}

export const createUseFun = (hookBuildParams: createUseFunInterface) => {
  return create(
    persist(
      (set: any): useFunStoreInterface => ({
        connectors: hookBuildParams.connectors,
        groupId: null,
        setGroupId: (groupId: string) => set(() => ({ groupId })),
        requiredActiveConnectors: 0,
        setRequiredActiveConnectors: (requiredActiveConnectors: number) =>
          set(() => ({ requiredActiveConnectors })),
        activeConnectors: 0,
        addActiveConnectors: () =>
          set((state: useFunStoreInterface) => ({
            activeConnectors: state.activeConnectors + 1,
          })),
        removeActiveConnectors: () =>
          set((state: useFunStoreInterface) => ({
            activeConnectors: state.activeConnectors - 1,
          })),
        resetActiveConnectors: () => set({ activeConnectors: 0 }),
        index: hookBuildParams.defaultIndex || 0,
        setIndex: (newIndex: number) => set(() => ({ index: newIndex })),
        resetIndex: () => set({ index: 0 }),
        FunWallet: null,
        setFunWallet: (FunWallet: FunWallet) => set(() => ({ FunWallet })),
        Authorizer: null,
        setAuthorizer: (Authorizer: Eoa) => set(() => ({ Authorizer })),
        uniqueId: null,
        setUniqueId: (uniqueId: string) => set(() => ({ uniqueId })),
        account: null,
        setAccount: (account: string) => set(() => ({ account })),
        ensName: null,
        setEnsName: (ensName: string) => set(() => ({ ensName })),
        chain: null,
        chainId: null,
        supportedChainIds: hookBuildParams.supportedChains,
        switchChain: (chainId: number) =>
          set(async ({ config }: useFunStoreInterface) => {
            return await handleChainSwitching(chainId, config);
          }),
        config: null,
        setConfig: (newConfig: any) => {
          return set(async (state: useFunStoreInterface) => {
            const finalConfig = {
              ...state.config,
              ...newConfig,
            };
            await configureEnvironment(finalConfig);
            return { config: finalConfig };
          });
        },
      }),
      {
        name: "fun-web-cache",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  );
};
