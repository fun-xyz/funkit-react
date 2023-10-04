import { GlobalEnvOption } from '@funkit/core'

export {
  CoinbaseWalletConnector,
  ConnectorArray,
  ConnectorTuple,
  ConnectorTupleWithStore,
  ConnectorType,
  FunWalletConnectorInterface,
  MetamaskConnector,
  OAuthProvider,
  SocialOauthConnector,
  SUPPORTED_OAUTH_PROVIDERS,
  useGetName,
  WalletConnectConnector,
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
} from '@funkit/core'
declare global {
  interface Window {
    globalEnvOption: GlobalEnvOption
  }
}
