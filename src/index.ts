import { GlobalEnvOption } from '@fun-xyz/core'

export {
  ConnectorArray,
  connectors,
  ConnectorTuple,
  ConnectorTupleWithStore,
  ConnectorType,
  useGetName,
} from './connectors'
export * from './hooks'
export { MagicAuthConnector as SocialLoginConnector } from './magicAuth/src/MagicAuth'
export * from './network/Networks'
export * from './store/CreateUseFunStore'
export { GasValidationResponse, transactionArgsInterface, transactionParams, transactionTypes } from './utils'
export { ExecutionReceipt, GlobalEnvOption } from '@fun-xyz/core'
declare global {
  interface Window {
    globalEnvOption: GlobalEnvOption
  }
}
