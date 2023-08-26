import { Auth } from '@fun-xyz/core'

import { useActiveClients } from './UseActiveClients'

const shallowCompare = (obj1: Record<string, any> | null | undefined, obj2: Record<string, any>): boolean => {
  if (obj1 == null) return false
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every((key) => Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key])
  )
}

// TODO it seems that this system will allow the primaryAuth to not be a part of the group?
export const useActiveAuth = (): Auth[] => {
  const activeClients = useActiveClients()
  const activeAuths: Auth[] = []

  activeClients.map((client) => {
    if (client?.active) {
      activeAuths.push(new Auth({ provider: client.provider }))
    }
  })
  return activeAuths
}
