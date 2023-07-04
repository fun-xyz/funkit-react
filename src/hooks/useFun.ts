import { shallow } from 'zustand/shallow'

import { connectors } from '../connectors'
import { FunTestnet, Goerli, OptimismGoerli } from '../network/Networks'
import { createUseFun } from '../store'

const CONNECTORS = [
  connectors.Metamask(),
  connectors.CoinbaseWallet(),
  connectors.WalletConnectV2(),
  connectors.SocialOauthConnector(['google', 'twitter', 'apple', 'discord']),
]

export const useFun = createUseFun({
  connectors: CONNECTORS,
  supportedChains: [Goerli, FunTestnet, OptimismGoerli],
  defaultIndex: 0,
})

export const ShallowEqual = shallow
