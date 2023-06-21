import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector, Web3ReactStore } from '@web3-react/types'

export interface ConnectorTuple {
  0: Connector
  1: Web3ReactHooks
}

export interface ConnectorTupleWithStore extends ConnectorTuple {
  2: Web3ReactStore
}

export type ConnectorArray = ConnectorTuple[] | ConnectorTupleWithStore[]

export interface FunWalletConnectorInterface {
  Connector: ConnectorTuple | ConnectorTupleWithStore
  activate: () => void
  deactivate: () => void
}
