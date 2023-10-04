import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

export const MetamaskConnector = () => initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

export const [connector, hooks] = MetamaskConnector()
export default MetamaskConnector
