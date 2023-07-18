import { Auth, FunWallet } from '@fun-xyz/core'

export interface FunAccountStoreInterface {
  index: number
  setIndex: (index: number) => void
  resetIndex: () => void
  FunWallet: FunWallet | null
  setFunWallet: (FunWallet: FunWallet) => void
  account: string | null
  setAccount: (account: string) => void
  setLogin: (index: number, account: string, funWallet: FunWallet, Auth: Auth, uniqueId: string) => void
  ensName: string | null
  setEnsName: (ensName: string) => void
}

export const configureFunAccountStore = (
  defaultIndex: number | undefined,
  get: any,
  set: any
): FunAccountStoreInterface => ({
  index: defaultIndex || 0,
  setIndex: (newIndex: number) => set({ index: newIndex }),
  resetIndex: () => set({ index: 0 }),
  FunWallet: null,
  setFunWallet: (FunWallet: FunWallet) => set({ FunWallet }),
  account: null,
  setAccount: (account: string) => set({ account }),
  setLogin: (index: number, account: string, funWallet: FunWallet, Auth: Auth, uniqueId: string) => {
    set({ index, account, FunWallet: funWallet, Auth, uniqueId })
  },
  ensName: null,
  setEnsName: (ensName: string) => set({ ensName }),
})
