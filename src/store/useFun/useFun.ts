import { Eoa, FunWallet } from "fun-wallet";
import { configureEnvironment } from "fun-wallet/dist/src/config";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ChainStoreInterface, handleChainSwitching } from "../chainStore";
import { ConfigureStoreInterface } from "../configureStore";

interface useFunStoreInterface
  extends ChainStoreInterface,
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

const createFunStore = (set: any): useFunStoreInterface => ({
  index: 0,
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
});

export const useFun = create(
  persist(createFunStore, {
    name: "fun-web-cache",
    storage: createJSONStorage(() => sessionStorage),
  })
);
