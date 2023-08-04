import { Chain } from '@fun-xyz/core'
import { PublicClient } from 'viem'

// export const Ethereum = Chain.getChain({ chainIdentifier: '1' })
export const Goerli = Chain.getChain({ chainIdentifier: 5 })
export const Arbitrum = Chain.getChain({ chainIdentifier: '42161' })
export const Polygon = Chain.getChain({ chainIdentifier: '137' })
export const Avalanche = Chain.getChain({ chainIdentifier: '43114' })
export const Binance = Chain.getChain({ chainIdentifier: '56' })
export const Optimism = Chain.getChain({ chainIdentifier: '10' })
export const OptimismGoerli = Chain.getChain({ chainIdentifier: '420' })

export const FunTestnet = Chain.getChain({
  rpcUrl: 'https://rpc.vnet.tenderly.co/devnet/bundler-test/55eff413-d465-4d63-8d98-7da15c63ed96',
})

export const chainName = {
  // '1': Ethereum,
  '5': Goerli,
  '10': Optimism,
  '56': Binance,
  '137': Polygon,
  '420': OptimismGoerli,
  '36865': FunTestnet,
  '43114': Avalanche,
  '42161': Arbitrum,
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

export const convertToChain = (chain: string | number): Chain => {
  if (typeof chain === 'string') {
    const parsedChain = parseInt(chain)
    return isNaN(parsedChain)
      ? chainNumber[chain.toLowerCase() as keyof typeof chainNumber]
      : chainName[chain as keyof typeof chainName]
  }
  return chainName[`${chain}` as keyof typeof chainName]
}

export const getPublicClient = async (chainId: string | number): Promise<PublicClient> => {
  const Chain = convertToChain(chainId)
  return Chain.getClient()
}
