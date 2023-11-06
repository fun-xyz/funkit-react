'use client'
import { Auth, GlobalEnvOption } from '@funkit/core'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import React, { useEffect, useState } from 'react'

import { useFunStoreInterface } from '@/store'

import { useFun } from '../UseFun'
import { authHookReturn } from './types'

const PRIVY_EMBEDDED_WALLET_IDENTIFIER = 'privy' // embedded wallets in privy are identified by this string to separate them from external wallets like metamask

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

type PrivyLoginOptions = (
  | 'wallet'
  | 'email'
  | 'google'
  | 'discord'
  | 'linkedin'
  | 'twitter'
  | 'apple'
  | 'sms'
  | 'github'
  | 'tiktok'
)[]

const DEFAULT_PRIVY_LOGIN_OPTIONS = ['email', 'google', 'discord', 'linkedin', 'twitter', 'apple']
const DEFAULT_PRIVY_APP_ID = 'clnatprpv00sfmi0fv3qc185b'

interface FunContextProviderProps {
  privyAppId?: string
  options: GlobalEnvOption
  loginMethods?: ('email' | 'google' | 'discord' | 'linkedin' | 'twitter' | 'apple' | 'sms' | 'github' | 'tiktok')[]
}

export function FunContextProvider({
  children,
  privyAppId,
  loginMethods,
  options,
}: React.PropsWithChildren<FunContextProviderProps>) {
  const { config, setConfig, initializeChainStore } = useFun((state: useFunStoreInterface) => ({
    config: state.config,
    setConfig: state.setConfig,
    initializeChainStore: state.initializeChainStore,
  }))

  useEffect(() => {
    if (!config) {
      if (!options || !options.chain || options.apiKey) throw new Error('Must provide chain and apiKey')
      setConfig(options)
      initializeChainStore(options.chain)
    }
  }, [config, initializeChainStore, options, setConfig])

  const loginOptions = loginMethods || DEFAULT_PRIVY_LOGIN_OPTIONS

  const appId = privyAppId || DEFAULT_PRIVY_APP_ID

  return (
    <div>
      <PrivyProvider
        appId={appId}
        config={{
          loginMethods: loginOptions as PrivyLoginOptions,
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
