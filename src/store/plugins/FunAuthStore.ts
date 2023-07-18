import { Auth } from '@fun-xyz/core'

type ActiveAuthAccountAddr = string
type FunWalletAccountAddr = string
// should create a set opf FunWalletAccount Addresses and the connectors they come from. Then i can just sort by number of connections greatest to smallest.
export interface IFunAuthStore {
  Auth: Auth | null // the primary auth provider
  setAuth: (Authorizer: Auth) => void
  FunGroupAccounts: {
    [key: ActiveAuthAccountAddr]: FunWalletAccountAddr[]
  }
  addFunGroupAccount: (newActiveAccount: ActiveAuthAccountAddr) => void
  removeFunGroupAccount: (oldActiveAccount: ActiveAuthAccountAddr) => void
}

export const configureAuthStore = (get: any, set: any): IFunAuthStore => ({
  Auth: null,
  setAuth: (Authorizer: Auth) => set({ Auth: Authorizer }),
  FunGroupAccounts: {},
  addFunGroupAccount: (newActiveAccount: ActiveAuthAccountAddr) => {
    const { FunGroupAccounts } = get()
    try {
      // async fetch group accounts call
      set({ FunGroupAccounts: { ...FunGroupAccounts, [newActiveAccount]: newActiveAccount } })
    } catch (error) {
      console.error(error)
    }
  },
  removeFunGroupAccount: (oldActiveAccount: ActiveAuthAccountAddr) => {
    const { FunGroupAccounts } = get()
    const newObj = Object.assign({}, FunGroupAccounts)
    delete newObj[oldActiveAccount]
    set({ FunGroupAccounts: newObj })
  },
})
