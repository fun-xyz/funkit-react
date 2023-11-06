'use client'
import { GlobalEnvOption } from '@funkit/core'
import { PrivyProvider } from '@privy-io/react-auth'
import React from 'react'

import { useFunStoreInterface } from '@/store'

import { useFun } from '../hooks/UseFun'

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

  // useEffect(() => {
  if (!config) {
    if (!options || !options.apiKey) throw new Error('Missing required config options')
    setConfig(options)
    if (!options.chain) throw new Error('Missing required chain options in config')
    initializeChainStore(options.chain)
  }
  // }, [config, initializeChainStore, options, setConfig])

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
