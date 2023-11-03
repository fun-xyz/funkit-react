import { FunWallet } from '@funkit/core'

import { withErrorLogging } from '../../utils/Logger'

export interface FunAccountStoreInterface {
  FunWallet: FunWallet | null
  setFunWallet: (FunWallet: FunWallet) => void
  account: string | null
  setAccount: (account: string) => void
  setLogin: (account: string, funWallet: FunWallet | null) => void
  ensName: string | null
  setEnsName: (ensName: string) => void
}

export const configureFunAccountStore = withErrorLogging((get: any, set: any): FunAccountStoreInterface => {
  // This should throw error
  // @ts-ignore
  someUnavailableFn()
  return {
    FunWallet: null,
    setFunWallet: (FunWallet: FunWallet) => set({ FunWallet }),
    account: null,
    setAccount: (account: string) => set({ account }),
    setLogin: (account: string, funWallet: FunWallet | null) => {
      set({ account, FunWallet: funWallet })
    },
    ensName: null,
    setEnsName: (ensName: string) => set({ ensName }),
  }
})
