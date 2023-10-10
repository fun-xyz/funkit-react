import { useActiveClients } from './UseActiveClients'

export const usePrimaryConnector = () => {
  const activeClients = useActiveClients()
  return activeClients.find((client) => client.active)
}
