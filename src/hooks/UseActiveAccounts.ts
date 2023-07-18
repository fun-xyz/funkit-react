import { ConnectorArray } from '../connectors/Types'

export const useActiveAccounts = (connections: ConnectorArray): string[] | null => {
  const activeAccountAddresses = connections
    .map((connector) => {
      return connector[1].useAccount()
    })
    .filter((address) => address !== undefined)

  if (activeAccountAddresses.length === 0) return null
  return activeAccountAddresses as string[]
}
