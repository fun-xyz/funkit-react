import { Auth } from '@funkit/core'
import { OAuthExtension, OAuthProvider } from '@magic-ext/oauth'
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider'
import { Magic } from 'magic-sdk'
import { useCallback, useEffect, useState } from 'react'

import SocialOauthConnector, { SUPPORTED_OAUTH_PROVIDERS } from '../../../connectors/SocialOAuthConnector'
import { convertToValidUserId, useFun, useFunStoreInterface } from '../../../index'
import { authHookReturn } from '../../auth/types'

export interface useSocialAuthBaseArgs {
  provider: OAuthProvider
  name: string
  redirectURI?: string
  networkOptions: {
    rpcUrl: string
    chainId: number
  }
}

export const UseSocialAuthBase = ({ provider, name, networkOptions }: useSocialAuthBaseArgs): authHookReturn => {
  const [magic, setMagic] = useState<InstanceWithExtensions<SDKBase, OAuthExtension[]> | null>(null)

  const [activating, setActivating] = useState(false)
  const [active, setActive] = useState(false)
  const [authAddr, setAuthAddr] = useState<string | undefined>(undefined)
  const [web3Provider, setWeb3Provider] = useState<any | undefined>(undefined)

  useEffect(() => {
    if (!magic) {
      console.log('initialize magic')
      const magicAuth = new Magic('pk_live_846F1095F0E1303C', {
        network: {
          chainId: networkOptions.chainId,
          rpcUrl: networkOptions.rpcUrl,
        },
        extensions: [new OAuthExtension()],
      })
      setMagic(magicAuth)
      setWeb3Provider(magicAuth.rpcProvider)
    }
    // login redirect account check

    const accountsChangedListener = (accounts: string[]) => {
      if (accounts.length === 0) {
        setActive(false)
        setAuthAddr(undefined)
      } else {
        setAuthAddr(accounts[0])
      }
    }
    if (web3Provider) web3Provider.on('accountsChanged', accountsChangedListener)

    const isAuthorized = async () => {
      if (!magic) return false
      console.log('check authorization', magic)
      const isLoggedIn = await magic.user.isLoggedIn()
      console.log('isLoggedIn', isLoggedIn)
      if (isLoggedIn) {
        return true
      }
      console.log('getRedirectResult')
      const redirectResult = await magic.oauth.getRedirectResult()
      console.log('redirectResult', redirectResult)
      if (redirectResult) {
        return true
      } else return false
    }
    isAuthorized()
      .then((result) => {
        if (result) {
          setActive(true)
          setActivating(false)
          web3Provider
            ?.request({ method: 'eth_accounts' })
            .then((accounts) => {
              if (accounts.length === 0) return
              setAuthAddr(accounts[0])
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          setActivating(false)
        }
      })
      .catch((err) => {
        console.log(err)
        setActivating(false)
      })

    return () => {
      if (web3Provider) web3Provider.off('accountsChanged', accountsChangedListener)
    }
  }, [magic, networkOptions, web3Provider])

  const login = useCallback(async () => {
    if (!magic) return
    setActivating(true)

    try {
      await magic.oauth.loginWithRedirect({ provider, redirectURI: window.location.href })
      return
    } catch (err) {
      console.log(err)
      return
    }
  }, [magic, provider])

  const logout = useCallback(async () => {
    if (!magic) return
    await magic.user.logout()
    setActive(false)
    setWeb3Provider(undefined)
    if (web3Provider)
      web3Provider.off('accountsChanged', () => {
        setAuthAddr(undefined)
      })
  }, [magic, web3Provider])

  return {
    auth: web3Provider ? new Auth({ provider: web3Provider }) : undefined,
    name,
    active,
    activating,
    authAddr,
    login,
    logout,
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
