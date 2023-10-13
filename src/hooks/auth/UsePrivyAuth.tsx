import { Auth } from '@funkit/core'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import React, { useEffect } from 'react'

import { authHookReturn } from './types'

export const usePrivyAuth = (): authHookReturn => {
  const { login, logout, ready, user, createWallet } = usePrivy()
  const { wallets } = useWallets()

  const [auth, setAuth] = React.useState<Auth | undefined>(undefined)

  useEffect(() => {
    if (ready && user && !user.wallet) {
      createWallet().catch((e) => {
        console.log('error creating wallet', e)
      })
    }
    if (wallets && auth == undefined) {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy')
      if (embeddedWallet == null) return
      embeddedWallet
        .getEthereumProvider()
        .then(async (eip1193provider) => {
          const auth = new Auth({ provider: eip1193provider })
          await auth.getAddress()
          setAuth(auth)
        })
        .catch((e) => {
          console.log('error getting provider', e)
        })
    }
  }, [auth, createWallet, ready, user, wallets])

  console.log('auth', auth, user)
  return {
    auth,
    active: ready,
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

interface FunContextProviderProps {
  children: any
  appId: string
}
export const FunContextProvider = ({ children, appId }: FunContextProviderProps) => {
  return (
    <div>
      <PrivyProvider
        appId={appId}
        config={{
          loginMethods: ['email', 'google', 'discord', 'linkedin', 'twitter', 'apple'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: 'https://your-logo-url',
          },
        }}
      >
        {children}
      </PrivyProvider>
    </div>
  )
}
