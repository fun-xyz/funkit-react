import type { Web3ReactHooks } from "@web3-react/core"
import type { Connector, Web3ReactStore } from "@web3-react/types"

export interface ConnectorTuple {
    0: Connector
    1: Web3ReactHooks
}

export interface ConnectorTupleWithStore extends ConnectorTuple {
    2: Web3ReactStore
}

export type ConnectorArray = ConnectorTuple[] | ConnectorTupleWithStore[]

export interface ConnectorStoreInterface {
    connectors: ConnectorArray
    groupId: string | null
    setGroupId: (groupId: string) => void
    requiredActiveConnectors: number
    setRequiredActiveConnectors: (requiredActiveConnectors: number) => void
    activeConnectors: number
    addActiveConnectors: () => void
    removeActiveConnectors: () => void
    resetActiveConnectors: () => void
}

// should we automatically build an Eoa for each connetor?

export const initializeConnectors = (connectorFunctions: (() => [Connector, Web3ReactHooks, Web3ReactStore])[]) => {
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
