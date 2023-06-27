import { shallow } from 'zustand/shallow'

import { connectors } from '../connectors'
import { Arbitrum, Goerli, Polygon } from '../network/networks'
import { createUseFun } from '../store'
export const useFun = createUseFun({
  connectors: [
    connectors.Metamask(),
    connectors.CoinbaseWallet(),
    connectors.WalletConnectV2(),
    connectors.SocialOauthConnector(['google', 'twitter', 'apple', 'discord']),
  ],
  supportedChains: [Goerli, Polygon, Arbitrum],
  defaultIndex: 0,
})

export const ShallowEqual = shallow
