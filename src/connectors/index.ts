import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
// import type { Web3ReactHooks } from "@web3-react/core";
import type { Connector } from '@web3-react/types'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { useEffect, useState } from 'react'

import { MagicAuthConnector } from '../magic-auth/src/Magic-Auth'
//
import CoinbaseWalletConnector from './coinbaseWallet'
import MetamaskConnector from './metaMask'
import SocialOauthConnector from './SocialOAuthConnector'
import WalletConnectV2Connector from './walletConnectV2'

export function useGetName(connector: Connector | MagicAuthConnector) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnectV2) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'

  if (connector instanceof MagicAuthConnector) {
    if (!mounted) return 'MagicAuth'
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
