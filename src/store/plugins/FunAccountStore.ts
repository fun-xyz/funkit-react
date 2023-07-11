import { Eoa, FunWallet } from '@fun-xyz/core'

export interface FunAccountStoreInterface {
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
})
