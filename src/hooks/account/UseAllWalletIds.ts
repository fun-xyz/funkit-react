import { Auth, Wallet } from '@funkit/core'
import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { IActiveAuthList, useFunStoreInterface } from '../..'
import { useFun } from '../UseFun'
import { useActiveClients, usePrevious } from '../util'

interface IUseFunAccountsReturn {
  activeClients: IActiveAuthList[]
  walletIds: Wallet[]
}

const activeClientsChanged = (
  previousClients: IActiveAuthList[] | undefined,
  activeClients: IActiveAuthList[]
): boolean => {
  if (previousClients == undefined) return true
  if (previousClients.length !== activeClients.length) return true
  for (let i = 0; i < previousClients.length; i++) {
    if (previousClients[i].userId !== activeClients[i].userId) return true
  }
  return false
}
// TODO configureEnvironment before updating the list is possible since the API key is required to fetch the list of wallets.
// TODO make sure it doesn't fetch repeatedly when the list is already fetched.
// Special hook which uses Funkit/core to fetch all wallets for each active and connected auth and returns the list in order of most common connections.
export const useFunWalletIds = (inputAuth?: Auth | Auth[], inputChain?: number): IUseFunAccountsReturn => {
  const { chainId, FunGroupAccounts, setFunGroupAccounts, FunAccounts, setFunAccounts } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
      chainId: state.chainId,
      FunGroupAccounts: state.FunGroupAccounts,
      setFunGroupAccounts: state.setFunGroupAccounts,
      FunAccounts: state.FunAccounts,
      setFunAccounts: state.setFunAccounts,
      account: state.account,
      activeUser: state.activeUser,
      setActiveUser: state.setActiveUser,
    }),
    shallow
  )
  const activeClients = useActiveClients()
  const previousClients = usePrevious(activeClients)

  useEffect(() => {
    if (chainId == null && inputChain == null) return
    if (activeClients.length === 0) return
    if (FunGroupAccounts && FunGroupAccounts.length > 0 && !activeClientsChanged(previousClients, activeClients)) return //

    const chain = inputChain ?? chainId
    const updateWalletList = async () => {
      try {
        const wallets: Wallet[][] = []
        if (inputAuth) {
          if (inputAuth instanceof Auth) {
            try {
              wallets.push(await inputAuth.getWallets(`${chain}`))
            } catch (error) {
              console.error(error)
            }
          } else {
            inputAuth.forEach(async (auth) => {
              try {
                wallets.push(await auth.getWallets(`${chain}`))
              } catch (error) {
                console.error(error)
              }
            })
          }
        } else {
          for (let i = 0; i < activeClients.length; i++) {
            const currentClient = activeClients[i]
            if (!currentClient.active) continue
            const currentAuth = new Auth({ provider: currentClient.provider })
            try {
              wallets.push(await currentAuth.getWallets(`${chain}`))
            } catch (error) {
              console.error(error)
            }
          }
        }

        if (wallets.flat().length === 0) return { sortedFunWallets: [] }
        const WalletSet: {
          [account: string]: { wallet: Wallet; count: number }
        } = {}
        wallets
          .concat()
          .flat()
          .forEach((wallet) => {
            if (WalletSet[wallet.walletAddr]) {
              WalletSet[wallet.walletAddr].count++
            } else {
              WalletSet[wallet.walletAddr] = { wallet, count: 1 }
            }
          })

        const sortedFunWallets = Object.entries(WalletSet)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([, val]) => val.wallet)
        return {
          sortedFunWallets,
        }
      } catch (error) {
        console.error(error)
        return { error }
      }
    }
    updateWalletList()
      .then((res) => {
        if (res.sortedFunWallets && res.sortedFunWallets.length > 0) {
          setFunGroupAccounts(res.sortedFunWallets)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }, [
    FunAccounts,
    FunGroupAccounts,
    activeClients,
    chainId,
    inputAuth,
    inputChain,
    previousClients,
    setFunAccounts,
    setFunGroupAccounts,
  ])

  return {
    activeClients,
    walletIds: FunGroupAccounts,
  }
}
