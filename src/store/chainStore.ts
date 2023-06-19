import { Chain, GlobalEnvOption } from 'fun-wallet'

import { convertToChain } from '../Networks'
import { buildAndUpdateConfig } from './configureStore'

export interface ChainStoreInterface {
  chain: string | null
  chainId: number | null
  supportedChains: Chain[]
  switchChain: (chain: number | string) => void
}

export const handleChainSwitching = async (newChain: number | string, oldConfig: Partial<GlobalEnvOption> | null) => {
  const Chain = convertToChain(newChain)
  if (!Chain) {
    throw new Error(`Invalid Chain: ${newChain}`)
  }
  const { config } = await buildAndUpdateConfig({ chain: Chain }, { ...oldConfig })
  return { chain: Chain, chainId: Chain.chainId, config }
}
