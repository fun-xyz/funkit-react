import { Auth } from '@funkit/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { useFunStoreInterface } from '../../store'
import { useFun } from '../UseFun'
import { usePrimaryConnector } from '../util'

export const useUserInfo = () => {
  const { wallet, activeUser, setActiveUser, allUsers, setAllUsers } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
      activeUser: state.activeUser,
      setActiveUser: state.setActiveUser,
      allUsers: state.allUsers,
      setAllUsers: state.setAllUsers,
    }),
    shallow
  )

  const primary = usePrimaryConnector()
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(
    async (resetActiveUser = false) => {
      if (wallet == null || loading) return
      setLoading(true)
      const primaryAuth = new Auth({ provider: primary.provider })
      try {
        const users = await wallet.getUsers(primaryAuth)
        if (users && users.length > 0) {
          setAllUsers(users)
          if (resetActiveUser) setActiveUser(users[0])
        }
        const userId = await primaryAuth.getUserId()
        setActiveUser({ userId })
      } catch (err) {
        console.log('error fetching Users', err)
      } finally {
        setLoading(false)
      }
    },
    [loading, primary.provider, setActiveUser, setAllUsers, wallet]
  )

  return {
    activeUser,
    setActiveUser,
    fetchUsers,
    allUsers,
    setAllUsers,
  }
}
