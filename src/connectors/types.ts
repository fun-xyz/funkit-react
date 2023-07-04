import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import type { Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { MagicAuthConnector } from 'src/magic-auth/src/Magic-Auth'

export { OAuthProvider } from '@magic-ext/oauth'

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

export type ConnectorType = Connector | MetaMask | CoinbaseWallet | WalletConnect | MagicAuthConnector
