import { Auth } from '@funkit/core'
import { useCallback, useEffect, useState } from 'react'

import { useFunStoreInterface } from '@/store'
import { convertToValidUserId } from '@/utils'

import { connector, hooks } from '../../../connectors/MetaMask'
import { useFun } from '../../UseFun'
import { authHookReturn } from '../types'

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
  }, [autoConnect, name])

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
  }, [account, active, auth, name, provider, setAuth, update])

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
