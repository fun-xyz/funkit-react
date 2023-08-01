import { Chain, configureEnvironment } from '@fun-xyz/core'
import { GlobalEnvOption } from '@fun-xyz/core'
import { shallow } from 'zustand/shallow'

import { MetamaskConnector } from '../connectors'
import { ConnectorArray } from '../connectors/Types'
import { FunTestnet, Goerli } from '../network/Networks'
import { createUseFunStore } from '../store'

export const useFun = createUseFunStore()

export const ShallowEqual = shallow

const DEFAULT_CONNECTORS = [MetamaskConnector()]

interface configureFunParams {
  connectors: ConnectorArray
  supportedChains?: Chain[]
  config?: GlobalEnvOption
}
const DEFAULT_FUN_WALLET_CONFIG: GlobalEnvOption = {
  apiKey: 'hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf',
  chain: FunTestnet,
}
export const configureNewFunStore = async (params?: configureFunParams) => {
  console.log('configureNewFunStore')
  // if (useFun.getState().connectors.length > 0) return
  if (!params) {
    useFun.setState({ connectors: DEFAULT_CONNECTORS })
    useFun.setState({ supportedChains: [FunTestnet, Goerli] })
  } else {
    if (params.connectors && params.connectors.length > 0) {
      if (typeof params.connectors[0] === 'function')
        throw new Error(
          "Error connectors must be initialized. i.e. don't pass in MetamaskConnector but MetamaskConnector()"
        )
      useFun.setState({ connectors: params.connectors })
    } else {
      useFun.setState({ connectors: DEFAULT_CONNECTORS })
    }
    if (params.supportedChains && params.supportedChains.length > 0) {
      useFun.setState({ supportedChains: params.supportedChains })
    } else {
      useFun.setState({ supportedChains: [FunTestnet, Goerli] })
    }

    if (params.config) {
      if (!params.config.apiKey) throw new Error('API Key must be set in config')
      await configureEnvironment(params.config as GlobalEnvOption)
      useFun.setState({ config: params.config })
      if (params.config.chain) {
        if (params.config.chain instanceof Chain) {
          useFun.setState({ chain: params.config.chain, chainId: Number(await params.config.chain.getChainId()) })
        } else throw new Error('Chain must be a Chain object')
      } else {
        throw new Error('Chain must be set in config')
      }
    } else {
      await configureEnvironment(DEFAULT_FUN_WALLET_CONFIG)
      useFun.setState({
        config: DEFAULT_FUN_WALLET_CONFIG,
        chain: FunTestnet,
        chainId: Number(await FunTestnet.getChainId()),
      })
    }
  }
}
