import { Auth } from '@funkit/core'
import { useRef } from 'react'

import { FunLogger } from '@/utils/Logger'

import { useUserInfo } from '../account/UseUserInfo'
import { useActiveClients } from './UseActiveClients'
import { usePrimaryConnector } from './UsePrimaryConnector'

const logger = new FunLogger()

const shallowCompare = (obj1: Record<string, any> | null | undefined, obj2: Record<string, any>): boolean => {
  if (obj1 == null) return false
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every((key) => Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key])
  )
}

/*
 * This hook is used to track which auth is the primary signer for a particular user.
 * It will return an array of auth objects which are active signers for the current active user.
 */
export const usePrimaryAuth = (): Auth[] => {
  const primary = usePrimaryConnector()
  const activeClients = useActiveClients()
  const { activeUser } = useUserInfo()
  const authRef = useRef<Auth[]>([])

  if (activeUser != null) {
    if (activeUser.groupInfo) {
      // logger.log('activeUser.groupInfo', activeUser.groupInfo)
      const memberAuths = activeUser.groupInfo.memberIds
        .map((memberId) => {
          // logger.log('memberId', memberId, activeClients)
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
        // logger.log('no valid auth found for group members.length 0')
        if (primary == null && !shallowCompare(authRef.current, [])) authRef.current = []
        else if (primary != null && !shallowCompare(authRef.current, [primary.auth])) {
          // logger.log('setting default auth because no group auths found')
          if (primary.auth) authRef.current = [primary.auth]
        }
      }
      // logger.log('setting Group ID clients', memberAuths)
      if (!shallowCompare(authRef.current, memberAuths)) authRef.current = memberAuths
    } else {
      // logger.log('activeUser', activeUser, activeClients)
      const activeAuthClient = activeClients.find((client) => client.userId === activeUser.userId.toLowerCase())
      if (activeAuthClient && !shallowCompare(authRef.current, [new Auth({ provider: activeAuthClient.provider })])) {
        // logger.log('default valid auth from activeClients', activeAuthClient)
        authRef.current = [new Auth({ provider: activeAuthClient.provider })]
      } else {
        // no valid auth found
        // logger.log('no valid auth found for non group active auth')
        if (!shallowCompare(authRef.current, [])) authRef.current = []
      }
    }
  } else {
    // logger.log('default connector auth')
    // the default state if there is no active user is either an empty array or an array with the primary provider as auth
    if (primary == null && !shallowCompare(authRef.current, [])) authRef.current = []
    else if (primary != null && !shallowCompare(authRef.current, [primary.auth])) {
      if (primary.auth) authRef.current = [primary.auth]
    }
  }
  return authRef.current
}
