'use client'
import { Auth } from '@funkit/core'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

import { logger } from '../../utils/Logger'
import { authHookReturn } from './types'

const PRIVY_EMBEDDED_WALLET_IDENTIFIER = 'privy' // embedded wallets in privy are identified by this string to separate them from external wallets like metamask

export const usePrivyAuth = (readonly = false): authHookReturn => {
  const { login, logout, ready, user, createWallet } = usePrivy()
  const { wallets } = useWallets()

  const [auth, setAuth] = useState<Auth | undefined>(undefined)

  useEffect(() => {
    if (ready && user && !user.wallet) {
      createWallet().catch((e) => {
        logger.error('UsePrivyAuth_createWallet_error', e)
      })
    }
    if (wallets && auth == undefined) {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === PRIVY_EMBEDDED_WALLET_IDENTIFIER)
      if (embeddedWallet == null) return
      embeddedWallet
        .getEthereumProvider()
        .then(async (eip1193provider) => {
          const auth = new Auth({ provider: eip1193provider })
          await auth.getAddress()
          setAuth(auth)
        })
        .catch((e) => {
          logger.error('UsePrivyAuth_getEthereumProvider_error', e)
        })
    }
  }, [auth, createWallet, readonly, ready, user, wallets])

  return {
    auth,
    active: ready && user?.wallet?.address != null,
    activating: false,
    authAddr: user?.wallet?.address,
    name: 'Privy',
    login: async () => {
      return new Promise((resolve) => {
        resolve(login())
      })
    },
    logout,
  }
}
