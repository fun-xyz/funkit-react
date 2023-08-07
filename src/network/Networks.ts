import { Chain } from '@fun-xyz/core'

// export const Ethereum = Chain.getChain({ chainIdentifier: '1' })
export const Goerli = '5'
export const Arbitrum = '42161'
export const Polygon = '137'
export const Avalanche = '43114'
export const Binance = '56'
export const Optimism = '10'
export const OptimismGoerli = '420'

export const FunTestnet = {
  rpcUrl: 'https://rpc.vnet.tenderly.co/devnet/bundler-test/55eff413-d465-4d63-8d98-7da15c63ed96',
}

export const chainNumber = {
  // ethereum: Ethereum,
  binance: Binance,
  polygon: Polygon,
  avalanche: Avalanche,
  arbitrum: Arbitrum,
  optimism: Optimism,
  optimismGoerli: OptimismGoerli,
  goerli: Goerli,
  funTestnet: FunTestnet,
}

export const convertToChain = async (chain: string | number): Promise<Chain> => {
  if (typeof chain === 'string') {
    const chainInfo = chainNumber[chain]
    if (chainInfo.rpcUrl) return await Chain.getChain({ rpcUrl: chainInfo.rpcUrl })
    return await Chain.getChain({ chainIdentifier: chainInfo })
  } else {
    return await Chain.getChain({ chainIdentifier: chain })
  }
}

export const getPublicClient = async (chainId: string | number): Promise<any> => {
  const Chain = await convertToChain(chainId)
  return Chain.getClient()
}
