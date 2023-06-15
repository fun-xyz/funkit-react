import { Connector } from '@web3-react/types'

import { ConnectorArray, ConnectorTupleWithStore } from '../connectors/Connector'

export interface ConnectorStoreInterface {
  connectors: ConnectorArray
  activeConnectors: Connector[]
  groupId: string | null
  setGroupId: (groupId: string) => void
  requiredActiveConnectors: number
  setRequiredActiveConnectors: (requiredActiveConnectors: number) => void
  setActiveConnectors: (activeConnectors: Connector[]) => void
  updateActiveConnectors: (activeConnectors: Connector[]) => void
}

// should we automatically build an Eoa for each connetor?

export const initializeConnectors = (connectorFunctions: (() => ConnectorTupleWithStore)[]) => {
  const connectors = connectorFunctions.map((connectorFunction) => connectorFunction())
  return connectors
}

export const getActiveConnectors = (connectors: ConnectorArray): ConnectorArray => {
  const activeConnectors: ConnectorArray = [...connectors]
  for (let i = 0; i < connectors.length; i++) {
    const connector = connectors[i]
    if (connector[1] && !connector[1].useIsActive()) {
      activeConnectors[i] = activeConnectors.pop()!
    }
  }
  return activeConnectors
}
