import { Auth } from '@fun-xyz/core'
import { useRef } from 'react'

import { useWalletGroupInfo } from '../account/UseWalletGroupInfo'
import { useActiveClients } from './UseActiveClients'
import { usePrimaryConnector } from './UsePrimaryConnector'

const shallowCompare = (obj1: Record<string, any> | null | undefined, obj2: Record<string, any>): boolean => {
  if (obj1 == null) return false
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every((key) => Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key])
  )
}

// TODO it seems that this system will allow the primaryAuth to not be a part of the group?
export const usePrimaryAuth = (): Auth[] => {
  const primary = usePrimaryConnector()
  const activeClients = useActiveClients()
  const { activeUser } = useWalletGroupInfo()
  const authRef = useRef<Auth[]>([])

  if (activeUser != null) {
    if (activeUser.groupInfo) {
      const memberIds = activeUser.groupInfo.memberIds
      const memberAuths = memberIds
        .map((memberId) => {
          const memberClient = activeClients.find((client) => client.userId === memberId)
          if (memberClient) {
            return new Auth({ provider: memberClient.provider })
          } else {
            return []
          }
        })
        .filter((auth) => auth != null) as Auth[]
      if (memberAuths.length === 0) {
        throw new Error('No valid auth found no member Auths')
      }
      if (!shallowCompare(authRef.current, memberAuths)) authRef.current = memberAuths
    } else {
      const activeAuthClient = activeClients.find((client) => client.userId === activeUser.userId)
      console.log('active client', activeAuthClient)
      if (activeAuthClient && !shallowCompare(authRef.current, [new Auth({ provider: activeAuthClient.provider })])) {
        authRef.current = [new Auth({ provider: activeAuthClient.provider })]
      } else {
        // no valid auth found
        if (!shallowCompare(authRef.current, [])) authRef.current = []
      }
    }
  } else {
    // the default state if there is no active user is either an empty array or an array with the primary provider as auth
    if (primary.provider == null && !shallowCompare(authRef.current, [])) authRef.current = []
    else if (primary.provider != null && !shallowCompare(authRef.current, [new Auth({ provider: primary.provider })])) {
      authRef.current = [new Auth({ provider: primary.provider })]
    }
  }
  return authRef.current
}
