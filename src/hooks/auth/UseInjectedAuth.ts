import { Auth } from '@funkit/core'
import { useCallback, useEffect } from 'react'

import { connector, hooks } from '../../connectors/MetaMask'
import { authHookReturn } from './types'

export interface useInjectedAuthArgs {
  name: string
  autoConnect?: boolean
}

export const useInjectedAuth = ({ name, autoConnect }: useInjectedAuthArgs): authHookReturn => {
  const { useAccount, useIsActivating, useIsActive, useProvider } = hooks
  const account = useAccount()
  const activating = useIsActivating()
  const active = useIsActive()
  const provider = useProvider()

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (!autoConnect) return
    void connector.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to ', name)
    })
  }, [autoConnect, name])

  const login = useCallback(async () => {
    try {
      await connector.activate()
    } catch (err) {
      console.log(err)
    }
  }, [])

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
  }, [])

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
