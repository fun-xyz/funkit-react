import { Auth, GlobalEnvOption, Wallet } from '@funkit/core'
import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { IActiveAuthList, useFunStoreInterface } from '../..'
import { logger } from '../../utils/Logger'
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
export const useFunWalletIds = (
  inputAuth?: Auth | Auth[],
  options?: GlobalEnvOption,
  inputChain?: number
): IUseFunAccountsReturn => {
  const { chainId, FunGroupAccounts, setFunGroupAccounts, FunAccounts, setFunAccounts, config } = useFun(
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
      config: state.config,
    }),
    shallow
  )

  const activeClients = useActiveClients()
  const previousClients = usePrevious(activeClients)

  useEffect(() => {
    if (chainId == null && inputChain == null) return

    if (activeClients.length === 0) {
      if (FunGroupAccounts.length > 0) setFunGroupAccounts([])
      return
    }
    if (!activeClientsChanged(previousClients, activeClients)) return //

    const chain = inputChain ?? chainId ?? config?.chain
    const updateWalletList = async () => {
      const fetchedWalletLists: Wallet[][] = []
      if (inputAuth) {
        if (inputAuth instanceof Auth) {
          try {
            fetchedWalletLists.push(await inputAuth.getWallets(`${chain}`))
          } catch (error: any) {
            logger.error('inputAuth.getWallets_error', error)
          }
        } else {
          inputAuth.forEach(async (auth) => {
            try {
              fetchedWalletLists.push(await auth.getWallets(`${chain}`))
            } catch (error) {
              logger.error('auth.getWallets_error', error)
            }
          })
        }
      } else {
        for (let i = 0; i < activeClients.length; i++) {
          const currentClient = activeClients[i]
          if (!currentClient.active) continue
          const currentAuth = new Auth({ provider: currentClient.provider })
          try {
            fetchedWalletLists.push(await currentAuth.getWallets(`${chain}`))
          } catch (error) {
            logger.error('currentAuth.getWallets_error', error)
          }
        }
      }

      if (fetchedWalletLists.flat().length === 0) return { sortedFunWallets: [] }
      const WalletSet: {
        [account: string]: { wallet: Wallet; count: number }
      } = {}
      fetchedWalletLists
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
    }
    updateWalletList()
      .then((res) => {
        if (res.sortedFunWallets) {
          setFunGroupAccounts(res.sortedFunWallets)
        }
      })
      .catch((err) => {
        logger.error('updateWalletList_error', err)
      })
  }, [
    FunAccounts,
    FunGroupAccounts,
    activeClients,
    chainId,
    config?.chain,
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
