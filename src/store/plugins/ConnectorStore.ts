import { ConnectorArray } from '../../connectors/Types'

export interface ConnectorStoreInterface {
  connectors: ConnectorArray
  groupId: string | null
  setGroupId: (groupId: string) => void
  requiredActiveConnectors: number
  setRequiredActiveConnectors: (requiredActiveConnectors: number) => void
}
