import { User, Wallet } from '@funkit/core'

export interface IActiveAuthList {
  active: boolean
  name: string
  account: string
  provider: any
  userId: string
}

export interface IFunAuthStore {
  activeAuthClients: IActiveAuthList[]
  setActiveAuthClients: (newActiveAuthClients: IActiveAuthList[]) => void
  activeClientSubscriber: number | null
  setActiveClientSubscriber: (newActiveClientSubscriber: number | null) => void
  FunGroupAccounts: Wallet[]
  setFunGroupAccounts: (newGroupAccounts: Wallet[]) => void
  FunAccounts: { [key: string]: { wallet: Wallet; count: number } }
  setFunAccounts: (newFunAccounts: { [key: string]: { wallet: Wallet; count: number } }) => void
  activeUser: User | null
  setActiveUser: (newActiveUser: User | null) => void
  allUsers: User[] | null
  setAllUsers: (newAllUsers: User[] | null) => void
  setNewAccountUsers: (newAccountUsers: User[], activeUser: User) => void
}

export const configureAuthStore = (get: any, set: any): IFunAuthStore => ({
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
  FunAccounts: {},
  setFunAccounts: (newFunAccounts: { [key: string]: { wallet: Wallet; count: number } }) => {
    set({ FunAccounts: newFunAccounts })
  },
  activeUser: null,
  setActiveUser: (newActiveUser: User | null) => {
    set({ activeUser: newActiveUser })
  },
  allUsers: null,
  setAllUsers: (newAllUsers: User[] | null) => {
    set({ allUsers: newAllUsers })
  },
  setNewAccountUsers: (newAccountUsers: User[], activeUser: User) => {
    set({ allUsers: newAccountUsers, activeUser })
  },
})
