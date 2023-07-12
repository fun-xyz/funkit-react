import { ConnectorArray } from '../../connectors/Types'

export interface ConnectorStoreInterface {
  connectors: ConnectorArray
  groupId: string | null
  setGroupId: (groupId: string) => void
  requiredActiveConnectors: number
  setRequiredActiveConnectors: (requiredActiveConnectors: number) => void
}

export const configureConnectorStore = (connectors: ConnectorArray, get: any, set: any): ConnectorStoreInterface => ({
  connectors,
  groupId: null,
  setGroupId: (groupId: string) => set(() => ({ groupId })),
  requiredActiveConnectors: 0,
  setRequiredActiveConnectors: (requiredActiveConnectors: number) => set(() => ({ requiredActiveConnectors })),
})
