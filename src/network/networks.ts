import { Chain } from '@fun-xyz/core'

export const Ethereum = new Chain({ chainId: '1' })
export const Goerli = new Chain({ chainId: '5' })
export const Arbitrum = new Chain({ chainId: '42161' })
export const Polygon = new Chain({ chainId: '137' })
export const Avalanche = new Chain({ chainId: '43114' })
export const Binance = new Chain({ chainId: '56' })
export const Optimism = new Chain({ chainId: '10' })
export const OptimismGoerli = new Chain({ chainId: '420' })

export const FunNetwork = new Chain({
  rpcUrl: 'https://rpc.vnet.tenderly.co/devnet/bundler-test/55eff413-d465-4d63-8d98-7da15c63ed96',
})

export const chainName = {
  '1': Ethereum,
  '56': Binance,
  '137': Polygon,
  '43114': Avalanche,
  '42161': Arbitrum,
  '10': Optimism,
  '420': OptimismGoerli,
  '5': Goerli,
  '36865': FunNetwork,
}

export const chainNumber = {
  Ethereum,
  Binance,
  Polygon,
  polygon: Polygon,
  Avalanche,
  Arbitrum,
  arbitrum: Arbitrum,
  Optimism,
  OptimismGoerli,
  Goerli,
  FunNetwork,
}

export const convertToChain = (chain: string | number): Chain => {
  if (typeof chain === 'string') {
    const parsedChain = parseInt(chain)
    return isNaN(parsedChain)
      ? chainNumber[chain as keyof typeof chainNumber]
      : chainName[chain as keyof typeof chainName]
  }
  return chainName[`${chain}` as keyof typeof chainName]
}
