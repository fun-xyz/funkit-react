import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { useEffect, useState } from 'react'

import { MagicAuthConnector } from '../magicAuth/src/MagicAuth'
//
import CoinbaseWalletConnector from './CoinbaseWallet'
import MetamaskConnector from './MetaMask'
import SocialOauthConnector from './SocialOAuthConnector'
import { ConnectorType } from './Types'
import WalletConnectV2Connector from './WalletConnectV2'

export const useGetName = (connector: ConnectorType): string => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnectV2) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'

  if (connector instanceof MagicAuthConnector) {
    if (!mounted) return 'OAuth'
    const name = connector.getName()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return 'Unknown'
}

export const connectors = {
  CoinbaseWallet: CoinbaseWalletConnector,
  Metamask: MetamaskConnector,
  WalletConnectV2: WalletConnectV2Connector,
  SocialOauthConnector,
}
export { CoinbaseWalletConnector, MetamaskConnector, SocialOauthConnector, WalletConnectV2Connector }
export * from './Types'
export { OAuthProvider } from '@magic-ext/oauth'
