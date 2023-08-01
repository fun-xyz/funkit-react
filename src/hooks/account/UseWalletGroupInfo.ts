import { User } from '@fun-xyz/core'
import { useEffect, useMemo } from 'react'
import { shallow } from 'zustand/shallow'

import { useFunStoreInterface } from '../../store'
import { useFun } from '../UseFun'

// Track the current active user
// Track if there is more than user for the wallet
// if there is only one the active user is that user
// if there is more than one set the first one as the default user
// function for settings the default user
export const useWalletGroupInfo = () => {
  const { wallet, activeUser, setActiveUser } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
      activeUser: state.activeUser,
      setActiveUser: state.setActiveUser,
    }),
    shallow
  )

  const groupInfo = useMemo(() => {
    if (wallet == null || wallet.userInfo == null) return null
    if (wallet.userInfo.size === 0) return null

    if (wallet.userInfo.size === 1) {
      const user: User = wallet.userInfo.values().next().value
      return {
        activeUser: user,
        allUsers: [user.userId],
      }
    } else {
      const users: string[] = []
      wallet.userInfo.forEach((user) => {
        users.push(user.userId)
      })
      return {
        activeUser: wallet.userInfo.values().next().value,
        allUsers: users,
      }
    }
  }, [wallet])

  useEffect(() => {
    if (activeUser == null && groupInfo && groupInfo.activeUser) setActiveUser(groupInfo?.activeUser)
  }, [groupInfo, activeUser, setActiveUser])

  return {
    activeUser,
    allUsers: groupInfo?.allUsers,
    setActiveUser,
  }
}
/// group Id 0x83790ceb4594f3cd4450781b3c59a44eef133084f28176db8993dbee9721dd98