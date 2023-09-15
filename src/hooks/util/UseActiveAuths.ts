import { Auth } from '@funkit/core'

import { useActiveClients } from './UseActiveClients'

export const useActiveAuths = (): Auth[] => {
  const activeClients = useActiveClients()
  const activeAuths: Auth[] = []

  activeClients.map((client) => {
    if (client?.active) {
      activeAuths.push(new Auth({ provider: client.provider }))
    }
  })
  return activeAuths
}
