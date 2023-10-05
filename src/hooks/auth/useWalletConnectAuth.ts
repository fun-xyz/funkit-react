import { Auth } from '@funkit/core'
import { useCallback, useEffect, useState } from 'react'

import { useFunStoreInterface } from '@/store'
import { convertToValidUserId } from '@/utils'

import { WalletConnectConnector } from '../../connectors/WalletConnectV2'
import { useFun } from '../UseFun'
import { authHookReturn } from './types'

const name = 'Wallet Connect'

export interface useWalletConnectAuthArgs {
  appName: string // project ID from walletconnect
  autoConnect?: boolean
}

export const useWalletConnectAuth = ({ appName, autoConnect }: useWalletConnectAuthArgs): authHookReturn => {
  const [connector, hooks] = WalletConnectConnector(appName)
  const { useAccount, useIsActivating, useIsActive, useProvider } = hooks
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
  }, [autoConnect, connector])

  useEffect(() => {
    if (active && account && !update) {
      setUpdate(true)
      const authListItem = {
        active,
        name,
        account,
        provider,
        userId: convertToValidUserId(account),
      }
      if (auth.length === 0 || auth.find((item) => item.account === account) === undefined) {
        const updatedAuthList = auth.concat([authListItem])
        setAuth(updatedAuthList)
      }
      return
    } else if (!active && update) {
      setUpdate(false)
      const updatedAuthList = auth.filter((item) => item.account !== account)
      setAuth(updatedAuthList)
    }
  }, [account, active, auth, provider, setAuth, update])

  const login = useCallback(async () => {
    try {
      await connector.activate()
    } catch (err) {
      console.log(err)
    }
  }, [connector])

  const logout = useCallback(async () => {
    try {
      if (connector?.deactivate) {
        await connector.deactivate()
      } else {
        await connector.resetState()
      }
    } catch (err) {
      console.error(err)
    }
  }, [connector])

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
