import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

export const InjectedConnector = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))
export const [connector, hooks, store] = InjectedConnector
