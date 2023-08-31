import { Chain } from '@funkit/core'
import { PublicClient } from 'viem'

export const Ethereum = '1'
export const Goerli = '5'
export const Arbitrum = '42161'
export const Polygon = '137'
export const Optimism = '10'
export const Base = '8453'

export const chainNumber = {
  ethereum: Ethereum,
  polygon: Polygon,
  arbitrum: Arbitrum,
  optimism: Optimism,
  goerli: Goerli,
  base: Base,
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
