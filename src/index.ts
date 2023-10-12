import { GlobalEnvOption } from '@funkit/core'

export {
  ConnectorArray,
  ConnectorTuple,
  ConnectorTupleWithStore,
  ConnectorType,
  FunWalletConnectorInterface,
  InitCoinbaseWalletConnector,
  InitWalletConnectConnector,
  OAuthProvider,
} from './connectors'
export * from './hooks'
export * from './hooks/auth'
export { MagicAuthConnector as SocialLoginConnector } from './magicAuth/src/MagicAuth'
export * from './network/Networks'
export * from './store'
export {
  convertToValidUserId,
  GasValidationResponse,
  IOperationsArgs as transactionArgsInterface,
  transactionParams,
  transactionTypes,
} from './utils'
export {
  Auth,
  Chain,
  configureEnvironment,
  ExecutionReceipt,
  FunWallet,
  generateRandomGroupId,
  GlobalEnvOption,
  Operation,
  OperationStatus,
  User,
  Wallet,
} from '@funkit/core'
declare global {
  interface Window {
    globalEnvOption: GlobalEnvOption
  }
}
