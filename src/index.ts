import { GlobalEnvOption } from '@fun-xyz/core'

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
export { MagicAuthConnector as SocialLoginConnector } from './magicAuth/src/MagicAuth'
export * from './network/Networks'
export * from './store/CreateUseFunStore'
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
  generateRandomGroupId,
  GlobalEnvOption,
  Operation,
  OperationStatus,
  User,
} from '@fun-xyz/core'
declare global {
  interface Window {
    globalEnvOption: GlobalEnvOption
  }
}
