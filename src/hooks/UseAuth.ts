import { Auth, Wallet } from '@fun-xyz/core'
import { useCallback, useEffect, useRef } from 'react'
import { WalletClient } from 'viem'
import { shallow } from 'zustand/shallow'

import { ConnectorArray, useFunStoreInterface, useGetName, usePrimaryConnector } from '..'
import { useTraceUpdate } from '../utils/UseTraceUpdates'
import { useFun } from './UseFun'

export interface IActiveAuthList {
  active: boolean
  name: string
  account: string
  provider: any
}

// hook which returns the active state of all the connectors
const useActiveClients = (connectors: ConnectorArray): IActiveAuthList[] => {
  const activeConnectors = connectors.map((connector) => {
    const provider = connector[1].useProvider()
    const active = connector[1].useIsActive()
    const account = connector[1].useAccount()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const name = useGetName(connector[0])

    return {
      active,
      name,
      account,
      provider,
    }
  })
  const oldConnectors = useRef<IActiveAuthList[]>([])
  if (oldConnectors.current.length === activeConnectors.length) {
    // check if any accounts have changed.
    for (let i = 0; i < activeConnectors.length; i++) {
      const currentConnector = activeConnectors[i]
      const oldConnector = oldConnectors.current[i]
      if (currentConnector.account !== oldConnector.account) {
        oldConnectors.current = activeConnectors
        return activeConnectors
      }
    }
  } else {
    oldConnectors.current = activeConnectors
    return activeConnectors
  }

  return oldConnectors.current
}

const usePrimaryAuth = () => {
  const primary = usePrimaryConnector()
  const prevPrimary = useRef<Auth | null>(null)

  if (primary.provider == null) return null
  const auth = new Auth({ provider: primary.provider })
  if (prevPrimary.current == null || auth.account !== prevPrimary.current.account) {
    prevPrimary.current = auth
    return prevPrimary.current
  }
  return prevPrimary.current
}

interface IUseAuthReturn {
  activeClients: {
    active: boolean
    name: string
    account: string
    provider: any
  }[]
  FunGroupAccounts: Wallet[]
  primaryAuth: Auth | null
  setPrimaryAuth: (client: WalletClient) => void
}

export const useAuth = (): IUseAuthReturn => {
  const { connectors, chainId, auth, setAuth, FunGroupAccounts, setFunGroupAccounts } = useFun(
    (state: useFunStoreInterface) => ({
      connectors: state.connectors,
      chainId: state.chainId,
      auth: state.Auth,
      setAuth: state.setAuth,
      FunGroupAccounts: state.FunGroupAccounts,
      setFunGroupAccounts: state.setFunGroupAccounts,
    }),
    shallow
  )

  // TODO optimize this by making it only update when the connectors change
  const activeClients = useActiveClients(connectors)
  const PrimaryAuth = usePrimaryAuth()

  useTraceUpdate({ activeClients, PrimaryAuth, auth, chainId, setAuth, setFunGroupAccounts })

  useEffect(() => {
    /* TODO this function will fetch the same data multiple times if there are multiple connectors. We should cache the results by Account address
     *  and only fetch if the results are not cached
     */
    const updateWalletList = async () => {
      try {
        console.log('updating wallet list')
        const existingWalletPromises: Promise<Wallet[]>[] = []
        for (let i = 0; i < activeClients.length; i++) {
          const currentClient = activeClients[i]
          if (!currentClient.active) continue
          const currentAuth = new Auth({ provider: currentClient.provider })
          existingWalletPromises.push(currentAuth.getWallets(`${chainId}`))
        }
        const wallets = await Promise.all(existingWalletPromises)
        if (wallets.flat().length === 0) return { sortedFunWallets: [] }
        // sort the wallets
        const WalletSet: { [account: string]: { wallet: Wallet; count: number } } = {}
        console.log('Wallets', wallets)
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

  useEffect(() => {
    const checkIfAuthIsSet = async () => {
      if (auth == null && PrimaryAuth != null) setAuth(PrimaryAuth)
      if (auth != null && PrimaryAuth != null && auth != PrimaryAuth) {
        if ((await auth.getAddress()) != (await PrimaryAuth.getAddress())) setAuth(PrimaryAuth)
      }
    }
    checkIfAuthIsSet()
  }, [auth, PrimaryAuth, setAuth])

  const setNewPrimaryAuth = useCallback(
    (client: WalletClient) => {
      const newPrimaryAuth = new Auth({ client })
      setAuth(newPrimaryAuth)
    },
    [setAuth]
  )

  return {
    activeClients,
    FunGroupAccounts,
    primaryAuth: auth,
    setPrimaryAuth: setNewPrimaryAuth,
  }
}
