import { Chain } from 'fun-wallet'

export const Ethereum = new Chain({ chainId: '1' })
export const Goerli = new Chain({ chainId: '5' })
export const Arbitrum = new Chain({ chainId: '42161' })
export const Polygon = new Chain({ chainId: '137' })
export const Avalanche = new Chain({ chainId: '43114' })
export const Binance = new Chain({ chainId: '56' })
export const Optimism = new Chain({ chainId: '10' })

export const chainName = {
  '1': Ethereum,
  '56': Binance,
  '137': Polygon,
  '43114': Avalanche,
  '42161': Arbitrum,
  '10': Optimism,
  '5': Goerli,
}

export const chainNumber = {
  Ethereum,
  Binance,
  Polygon,
  Avalanche,
  Arbitrum,
  Optimism,
  Goerli,
}

export const convertToChain = (chain: string | number): Chain => {
  if (typeof chain === 'string') {
    const parsedChain = parseInt(chain)
    return isNaN(parsedChain) ? chainNumber[chain] : chainName[chain]
  }
  return chainName[chain]
}