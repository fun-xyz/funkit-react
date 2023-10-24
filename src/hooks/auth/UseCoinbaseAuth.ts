import { Auth } from '@funkit/core'
import { useCallback, useEffect, useState } from 'react'

import { CoinbaseWalletSDKOptions, InitCoinbaseWalletConnector } from '../../connectors/CoinbaseWallet'
import { useFunStoreInterface } from '../../store'
import { convertToValidUserId } from '../../utils'
import { useFun } from '../UseFun'
import { authHookReturn } from './types'

const name = 'Coinbase Wallet'

export interface useCoinbaseAuthArgs {
  // CoinbaseWalletConnector: [CoinbaseWallet, Web3ReactHooks, Web3ReactStore]
  options: CoinbaseWalletSDKOptions
  autoConnect?: boolean
}

export const CoinbaseWalletConnector = InitCoinbaseWalletConnector()

export const useCoinbaseAuth = ({ options, autoConnect }: useCoinbaseAuthArgs): authHookReturn => {
  const connector = CoinbaseWalletConnector[0] //CoinbaseWalletConnector[0]
  const { useAccount, useIsActivating, useIsActive, useProvider } = CoinbaseWalletConnector[1]
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
    void connector.connectEagerly(options).catch(() => {
      console.debug('Failed to connect eagerly to ', name)
    })
  }, [autoConnect, connector, options])

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
  }, [account, active, auth, provider, setAuth, update])

  const login = useCallback(async () => {
    try {
      await connector.activate(options)
    } catch (err) {
      console.error(err)
    }
  }, [connector, options])

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
