import { Auth } from '@fun-xyz/core'
import { useRef } from 'react'

import { useUserInfo } from '../account/UseUserInfo'
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
  const { activeUser } = useUserInfo()
  const authRef = useRef<Auth[]>([])

  if (activeUser != null) {
    if (activeUser.groupInfo) {
      // console.log('activeUser.groupInfo', activeUser.groupInfo)
      const memberAuths = activeUser.groupInfo.memberIds
        .map((memberId) => {
          // console.log('memberId', memberId, activeClients)
          const memberClient = activeClients.find(
            (client) => ((client.userId ?? '') as string).toLowerCase() === memberId
          )
          if (memberClient) {
            return new Auth({ provider: memberClient.provider })
          } else {
            return undefined
          }
        })
        .filter((auth) => auth != null) as Auth[]
      if (memberAuths.length === 0) {
        // no valid auth found
        // console.log('no valid auth found for group members.length 0')
        if (primary.provider == null && !shallowCompare(authRef.current, [])) authRef.current = []
        else if (
          primary.provider != null &&
          !shallowCompare(authRef.current, [new Auth({ provider: primary.provider })])
        ) {
          // console.log('setting default auth because no group auths found')
          authRef.current = [new Auth({ provider: primary.provider })]
        }
      }
      // console.log('setting Group ID clients', memberAuths)
      if (!shallowCompare(authRef.current, memberAuths)) authRef.current = memberAuths
    } else {
      // console.log('activeUser', activeUser, activeClients)
      const activeAuthClient = activeClients.find((client) => client.userId === activeUser.userId.toLowerCase())
      if (activeAuthClient && !shallowCompare(authRef.current, [new Auth({ provider: activeAuthClient.provider })])) {
        // console.log('default valid auth from activeClients', activeAuthClient)
        authRef.current = [new Auth({ provider: activeAuthClient.provider })]
      } else {
        // no valid auth found
        // console.log('no valid auth found for non group active auth')
        if (!shallowCompare(authRef.current, [])) authRef.current = []
      }
    }
  } else {
    // console.log('default connector auth')
    // the default state if there is no active user is either an empty array or an array with the primary provider as auth
    if (primary.provider == null && !shallowCompare(authRef.current, [])) authRef.current = []
    else if (primary.provider != null && !shallowCompare(authRef.current, [new Auth({ provider: primary.provider })])) {
      authRef.current = [new Auth({ provider: primary.provider })]
    }
  }
  return authRef.current
}
