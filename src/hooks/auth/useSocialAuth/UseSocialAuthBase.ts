'use client'
import { Auth } from '@funkit/core'
import { OAuthProvider } from '@magic-ext/oauth'
import { useCallback, useEffect, useState } from 'react'

import SocialOauthConnector, { SUPPORTED_OAUTH_PROVIDERS } from '../../../connectors/SocialOAuthConnector'
import { convertToValidUserId, useFun, useFunStoreInterface } from '../../../index'
import { authHookReturn } from '../../auth/types'

export enum SocialAuthProviders {
  Google = 'google',
  Twitter = 'twitter',
  Discord = 'discord',
  Apple = 'apple',
}

export interface useSocialAuthBaseArgs {
  provider: OAuthProvider
  name: string
  redirectURI?: string
  networkOptions: {
    rpcUrl: string
    chainId: number
  }
}

export const SocialAuthConnector = SocialOauthConnector(SUPPORTED_OAUTH_PROVIDERS)

export interface useSocialAuthConnectorBaseArgs {
  // SocialAuthConnector: [SocialLoginConnector, Web3ReactHooks, Web3ReactStore]
  oAuthProvider: OAuthProvider
  name: string
  autoConnect?: boolean
}

export const useSocialAuthConnectorBase = ({
  // SocialAuthConnector,
  oAuthProvider,
  name,
  autoConnect,
}: useSocialAuthConnectorBaseArgs): authHookReturn => {
  const connector = SocialAuthConnector[0]
  const { useAccount, useIsActivating, useIsActive, useProvider } = SocialAuthConnector[1]
  const account = useAccount()
  const activating = useIsActivating()
  const active = useIsActive()
  const provider = useProvider()

  const { auth, setAuth } = useFun((state: useFunStoreInterface) => ({
    auth: state.activeAuthClients,
    setAuth: state.setActiveAuthClients,
  }))

  const [update, setUpdate] = useState(false)

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (!autoConnect) return
    void connector.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to ', name)
    })
  }, [autoConnect, connector, name])

  useEffect(() => {
    if (active && account && !update) {
      setUpdate(true)
      const authListItem = {
        active,
        name,
        account,
        provider,
        userId: convertToValidUserId(account),
        auth: new Auth({ provider }),
      }
      if (auth.length === 0 || auth.find((item) => item.account === account) === undefined) {
        const updatedAuthList = auth.concat([authListItem])
        setAuth(updatedAuthList)
      }
      return
    } else if (!active && update) {
      setUpdate(false)
    }
  }, [account, active, auth, name, provider, setAuth, update])

  const login = useCallback(async () => {
    try {
      await connector.activate({ oAuthProvider })
    } catch (err) {
      console.log(err)
    }
  }, [connector, oAuthProvider])

  const logout = useCallback(async () => {
    try {
      if (connector?.deactivate) {
        await connector.deactivate()
      } else {
        await connector.resetState()
      }
      const updatedAuthList = auth.filter((item) => item.account !== account)
      if (updatedAuthList.length === auth.length) return // no change
      setAuth(updatedAuthList)
    } catch (err) {
      console.error(err)
    }
  }, [account, auth, connector, setAuth])

  return {
    auth: provider ? new Auth({ provider }) : undefined,
    active,
    activating,
    authAddr: account,
    name,
    login,
    logout,
  }
}
