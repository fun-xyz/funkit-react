import { Chain } from '@fun-xyz/core'
import { PublicClient } from 'viem'

// export const Ethereum = Chain.getChain({ chainIdentifier: '1' })
export const Goerli = '5'
export const Arbitrum = '42161'
export const Polygon = '137'
export const Optimism = '10'

// Polygon
// Arbitrum one
// optimism
// Goerli

export const chainNumber = {
  // ethereum: Ethereum,
  polygon: Polygon,
  arbitrum: Arbitrum,
  optimism: Optimism,
  goerli: Goerli,
}

export const convertToChain = async (chain: string | number): Promise<Chain> => {
  if (typeof chain === 'string') {
    const chainInfo = chainNumber[chain]
    if (!chainInfo) return await Chain.getChain({ chainIdentifier: chain })
    if (chainInfo.rpcUrl) return await Chain.getChain({ rpcUrl: chainInfo.rpcUrl })
    return await Chain.getChain({ chainIdentifier: chainInfo })
  } else {
    return await Chain.getChain({ chainIdentifier: chain })
  }
}

export const getPublicClient = async (chainId: string | number): Promise<PublicClient> => {
  const Chain = await convertToChain(chainId)
  return Chain.getClient() as any as PublicClient
}
