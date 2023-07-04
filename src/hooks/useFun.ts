import { shallow } from 'zustand/shallow'

import { connectors } from '../connectors'
import { FunNetwork, Goerli, OptimismGoerli } from '../network/networks'
import { createUseFun } from '../store'

const CONNECTORS = [
  connectors.Metamask(),
  connectors.CoinbaseWallet(),
  connectors.WalletConnectV2(),
  connectors.SocialOauthConnector(['google', 'twitter', 'apple', 'discord']),
]

export const useFun = createUseFun({
  connectors: CONNECTORS,
  supportedChains: [Goerli, FunNetwork, OptimismGoerli],
  defaultIndex: 0,
})

export const ShallowEqual = shallow

/**
 * Returns the index of the connector based on its name.
 * @param connectorName The name of the connector.
 * @returns The index of the connector, or -1 if the connector is not found.
 */
export const connectorIndexUtil = (connectorName: string): number => {
  switch (connectorName.toLowerCase()) {
    case 'metamask':
      return 0
    case 'injected':
      return 0
    case 'coinbase wallet':
      return 1
    case 'coinbasewallet':
      return 1
    case 'walletconnect':
      return 2
    case 'google':
      return 3
    case 'twitter':
      return 3
    case 'apple':
      return 3
    case 'discord':
      return 3
    default:
      return -1
  }
}
