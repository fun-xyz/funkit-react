import { FunWallet } from '@funkit/core'

export interface FunAccountStoreInterface {
  FunWallet: FunWallet | null
  setFunWallet: (FunWallet: FunWallet) => void
  account: string | null
  setAccount: (account: string) => void
  setLogin: (account: string, funWallet: FunWallet | null) => void
  ensName: string | null
  setEnsName: (ensName: string) => void
  groupIds: string[]
  setGroupIds: (groupIds: string[]) => void
}

export const configureFunAccountStore = (get: any, set: any): FunAccountStoreInterface => ({
  FunWallet: null,
  setFunWallet: (FunWallet: FunWallet) => set({ FunWallet }),
  account: null,
  setAccount: (account: string) => set({ account }),
  setLogin: (account: string, funWallet: FunWallet | null) => {
    set({ account, FunWallet: funWallet })
  },
  ensName: null,
  setEnsName: (ensName: string) => set({ ensName }),
  groupIds: [],
  setGroupIds: (groupIds: string[]) => set({ groupIds }),
})
