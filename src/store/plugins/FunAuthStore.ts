import { Auth, Wallet } from '@fun-xyz/core'

export interface IActiveAuthList {
  active: boolean
  name: string
  account: string
  provider: any
  userId: string
}

// should create a set opf FunWalletAccount Addresses and the connectors they come from. Then i can just sort by number of connections greatest to smallest.
export interface IFunAuthStore {
  Auth: Auth | null // the primary auth provider
  setAuth: (Authorizer: Auth) => void
  activeAuthClients: IActiveAuthList[]
  setActiveAuthClients: (newActiveAuthClients: IActiveAuthList[]) => void
  activeClientSubscriber: number | null
  setActiveClientSubscriber: (newActiveClientSubscriber: number | null) => void
  FunGroupAccounts: Wallet[]
  setFunGroupAccounts: (newGroupAccounts: Wallet[]) => void
}

export const configureAuthStore = (get: any, set: any): IFunAuthStore => ({
  Auth: null,
  setAuth: (Authorizer: Auth) => set({ Auth: Authorizer }),
  activeAuthClients: [],
  setActiveAuthClients: (newActiveAuthClients: IActiveAuthList[]) => {
    set({ activeAuthClients: newActiveAuthClients })
  },
  activeClientSubscriber: null,
  setActiveClientSubscriber: (newActiveClientSubscriber: number | null) => {
    set({ activeClientSubscriber: newActiveClientSubscriber })
  },
  FunGroupAccounts: [],
  setFunGroupAccounts: (newGroupAccounts: Wallet[]) => {
    set({ FunGroupAccounts: newGroupAccounts })
  },
})
