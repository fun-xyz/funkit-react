import { ConnectorArray } from '../../connectors/types'

export interface ConnectorStoreInterface {
  connectors: ConnectorArray
  groupId: string | null
  setGroupId: (groupId: string) => void
  requiredActiveConnectors: number
  setRequiredActiveConnectors: (requiredActiveConnectors: number) => void
}
