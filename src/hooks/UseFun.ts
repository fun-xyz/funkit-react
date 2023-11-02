import { Chain, configureEnvironment } from '@funkit/core'
import { GlobalEnvOption } from '@funkit/core'
import { shallow } from 'zustand/shallow'

import { Arbitrum, Goerli, Optimism, Polygon } from '../network/Networks'
import { createUseFunStore } from '../store'
import { withErrorLogging } from '@/utils/Logger'

export const useFun = createUseFunStore()

export const ShallowEqual = shallow

interface configureFunParams {
  supportedChains?: (number | string)[]
  config?: GlobalEnvOption
}
const DEFAULT_FUN_WALLET_CONFIG: GlobalEnvOption = {
  apiKey: 'hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf',
  chain: '5',
}
export const configureNewFunStore = withErrorLogging(async (params?: configureFunParams) => {
  if (!params) {
    useFun.setState({ supportedChains: [Optimism, Arbitrum, Polygon, Goerli] })
  } else {
    if (params.supportedChains && params.supportedChains.length > 0) {
      useFun.setState({ supportedChains: params.supportedChains })
    } else {
      useFun.setState({
        supportedChains: [Optimism, Arbitrum, Polygon, Goerli],
      })
    }

    if (params.config) {
      if (!params.config.apiKey) throw new Error('API Key must be set in config')
      await configureEnvironment(params.config as GlobalEnvOption)
      useFun.setState({ config: params.config })
      if (params.config.chain) {
        if (params.config.chain instanceof Chain) {
          useFun.setState({
            chain: params.config.chain,
            chainId: Number(await params.config.chain.getChainId()),
          })
        } else {
          const chain = await Chain.getChain({
            chainIdentifier: params.config.chain,
          })
          useFun.setState({ chain, chainId: Number(await chain.getChainId()) })
        }
      } else {
        throw new Error('Chain must be set in config')
      }
    } else {
      await configureEnvironment(DEFAULT_FUN_WALLET_CONFIG)
      useFun.setState({
        config: DEFAULT_FUN_WALLET_CONFIG,
        chain: await Chain.getChain({ chainIdentifier: Goerli }),
        chainId: 5,
      })
    }
  }
})
