import { OAuthExtension, OAuthProvider } from '@magic-ext/oauth'
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider'
import { Magic } from 'magic-sdk'
import { useCallback, useEffect, useState } from 'react'

import { socialLoginReturn } from '../../auth/types'

export interface useSocialAuthBaseArgs {
  provider: OAuthProvider
  name: string
  redirectURI?: string
  networkOptions: {
    rpcUrl: string
    chainId: number
  }
}

export const UseSocialAuthBase = ({ provider, name, networkOptions }: useSocialAuthBaseArgs): socialLoginReturn => {
  const [magic, setMagic] = useState<InstanceWithExtensions<SDKBase, OAuthExtension[]> | null>(null)

  const [activating, setActivating] = useState(false)
  const [active, setActive] = useState(false)
  const [authAddr, setAuthAddr] = useState<string | undefined>(undefined)
  const [web3Provider, setWeb3Provider] = useState<any | undefined>(undefined)

  useEffect(() => {
    if (!magic) {
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
      console.log('isAuthorized', magic)
      const isLoggedIn = await magic.user.isLoggedIn()
      console.log('isLoggedIn', isLoggedIn)
      if (isLoggedIn) {
        return true
      }
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
      localStorage.setItem('funConnecting', 'true')
      console.log(
        'setting test',
        localStorage.getItem('funConnecting'),
        localStorage.getItem('funConnecting') === 'true'
      )

      const result = await magic.oauth.loginWithRedirect({ provider, redirectURI: window.location.href })

      if (await magic.user.isLoggedIn()) {
        if (magic.rpcProvider) {
          setWeb3Provider(magic.rpcProvider)
          setActive(true)
          setActivating(false)
        }
        // TODO handle this case since it would be an error
      }
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
    if (web3Provider)
      web3Provider.off('accountsChanged', () => {
        setAuthAddr(undefined)
      })
  }, [magic, web3Provider])

  return {
    auth: web3Provider,
    name,
    active,
    activating,
    authAddr,
    login,
    logout,
  }
}
