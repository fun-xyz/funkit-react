import { Auth } from '@fun-xyz/core'

import { useWalletGroupInfo } from '../account/UseWalletGroupInfo'
import { useActiveClients } from './UseActiveClients'
import { usePrimaryConnector } from './UsePrimaryConnector'

// TODO it seems that this system will allow the primaryAuth to not be a part of the group?
export const usePrimaryAuth = (): Auth[] => {
  const primary = usePrimaryConnector()
  const activeClients = useActiveClients()
  const { activeUser } = useWalletGroupInfo()

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
      return memberAuths
    } else {
      const activeAuthClient = activeClients.find((client) => client.userId === activeUser.userId)
      if (activeAuthClient) {
        return [new Auth({ provider: activeAuthClient.provider })]
      } else {
        // no valid auth found
        return []
      }
    }
  }

  if (primary.provider == null) return []
  const auth = new Auth({ provider: primary.provider })
  return [auth]
}
