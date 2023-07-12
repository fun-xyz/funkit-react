import { ConnectorArray } from '../../connectors/Types'

export interface ConnectorStoreInterface {
  connectors: ConnectorArray
  initializeConnectors: (connectors: ConnectorArray) => void
}

export const configureConnectorStore = (connectors: ConnectorArray, get: any, set: any): ConnectorStoreInterface => ({
  connectors,
  initializeConnectors: (connectors: ConnectorArray) => set({ connectors }),
})
