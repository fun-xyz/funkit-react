import { User } from '@fun-xyz/core'
import { Auth } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { useFunStoreInterface } from '@/store'

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
      wallet
        .getUsers(new Auth({ provider: primary.provider }))
        .then((users: User[]) => {
          if (users && users.length > 0) {
            setAllUsers(users)
            if (resetActiveUser) setActiveUser(users[0])
          }
          setLoading(false)
        })
        .catch((err: any) => {
          console.log('Error fetching users: ', err)
          setLoading(false)
        })
    },
    [loading, primary.provider, setActiveUser, setAllUsers, wallet]
  )

  return { activeUser, setActiveUser, fetchUsers, allUsers, setAllUsers }
}
