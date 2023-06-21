import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
// import type { Web3ReactHooks } from "@web3-react/core";
import type { Connector } from '@web3-react/types'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

import { MagicAuthConnector } from '../magic-auth/src/Magic-Auth'
//
import CoinbaseWalletConnector from './coinbaseWallet'
import MagicAuthConnection from './magicAuthConnector'
import MetamaskConnector from './metaMask'
import WalletConnectV2Connector from './walletConnectV2'

export function getName(connector: Connector | MagicAuthConnector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnectV2) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network'
  if (connector['name']) {
    return connector['name'].charAt(0).toUpperCase() + connector['name'].slice(1)
  }
  return 'Unknown'
}

export const connectors = {
  CoinbaseWallet: CoinbaseWalletConnector,
  Metamask: MetamaskConnector,
  WalletConnectV2: WalletConnectV2Connector,
  MagicAuthConnection,
}
