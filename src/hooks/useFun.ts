import { shallow } from 'zustand/shallow'

import { connectors } from '../connectors'
import { Goerli, OptimismGoerli } from '../network/networks'
import { createUseFun } from '../store'
export const useFun = createUseFun({
  connectors: [
    connectors.Metamask(),
    connectors.CoinbaseWallet(),
    connectors.WalletConnectV2(),
    connectors.SocialOauthConnector(['google', 'twitter', 'apple', 'discord']),
  ],
  supportedChains: [Goerli, OptimismGoerli],
  defaultIndex: 0,
})

export const ShallowEqual = shallow
