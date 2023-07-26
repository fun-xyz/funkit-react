import { Auth, Wallet } from '@fun-xyz/core'
import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { useFunStoreInterface } from '../..'
import { useFun } from '../UseFun'
import { useActiveClients, usePrimaryAuth, useTraceUpdate } from '../util'

interface IUseAuthReturn {
  activeClients: {
    active: boolean
    name: string
    account: string
    provider: any
  }[]
  FunGroupAccounts: Wallet[]
  primaryAuth: Auth | null
}

export const useAuth = (): IUseAuthReturn => {
  const { chainId, FunGroupAccounts, setFunGroupAccounts } = useFun(
    (state: useFunStoreInterface) => ({
      chainId: state.chainId,
      FunGroupAccounts: state.FunGroupAccounts,
      setFunGroupAccounts: state.setFunGroupAccounts,
    }),
    shallow
  )

  // TODO optimize this by making it only update when the connectors change
  const activeClients = useActiveClients()
  const PrimaryAuth = usePrimaryAuth()

  // useTraceUpdate({ activeClients, PrimaryAuth, chainId, setFunGroupAccounts })

  useEffect(() => {
    /* TODO this function will fetch the same data multiple times if there are multiple connectors. We should cache the results by Account address
     *  and only fetch if the results are not cached
     */
    const updateWalletList = async () => {
      try {
        // console.log('updating wallet list')
        const wallets: Wallet[][] = []
        for (let i = 0; i < activeClients.length; i++) {
          const currentClient = activeClients[i]
          if (!currentClient.active) continue
          const currentAuth = new Auth({ provider: currentClient.provider })
          try {
            wallets.push(await currentAuth.getWallets(`${chainId}`))
          } catch (error) {
            console.error(error)
          }
        }

        if (wallets.flat().length === 0) return { sortedFunWallets: [] }
        // sort the wallets
        const WalletSet: { [account: string]: { wallet: Wallet; count: number } } = {}
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
          .map(([_, val]) => val.wallet)

        return {
          sortedFunWallets,
        }
      } catch (error) {
        console.error(error)
        return { error }
      }
    }
    updateWalletList().then((res) => {
      if (res.sortedFunWallets && res.sortedFunWallets.length > 0) {
        setFunGroupAccounts(res.sortedFunWallets)
      }
    })
  }, [activeClients, chainId, setFunGroupAccounts])

  return {
    activeClients,
    FunGroupAccounts,
    primaryAuth: PrimaryAuth,
  }
}
