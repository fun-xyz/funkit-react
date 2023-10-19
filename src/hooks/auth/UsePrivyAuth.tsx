'use client'
import { Auth, GlobalEnvOption } from '@funkit/core'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import React, { useEffect, useState } from 'react'

import { useConfig } from '../account/UseConfig'
import { authHookReturn } from './types'

export const usePrivyAuth = (readonly = false): authHookReturn => {
  const { login, logout, ready, user, createWallet } = usePrivy()
  const { wallets } = useWallets()

  const [auth, setAuth] = useState<Auth | undefined>(undefined)

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

interface FunContextProviderProps {
  children: any
  appId: string
  options: GlobalEnvOption
}
export const FunContextProvider = ({ children, appId, options }: FunContextProviderProps) => {
  const [set, setset] = useState(false)
  const { setConfig } = useConfig()

  if (set == false) {
    setConfig(options)
    setset(true)
  }

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
