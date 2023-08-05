import { User } from '@fun-xyz/core'
import { Auth } from '@fun-xyz/core'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (wallet == null || loading) return
    if (activeUser == null) {
      setLoading(true)
      wallet.getUsers(new Auth({ provider: primary.provider })).then((users: User[]) => {
        if (users && users.length > 0) {
          setAllUsers(users)
          setActiveUser(users[0])
        }
        setLoading(false)
      })
    }
  }, [activeUser, loading, setActiveUser, setAllUsers, wallet, primary.provider])

  return { activeUser, setActiveUser, allUsers, setAllUsers }
}
