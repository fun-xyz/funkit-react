import { Chain, GlobalEnvOption } from 'fun-wallet'

import { convertToChain } from '../Networks'
import { buildAndUpdateConfig } from './configureStore'

export interface ChainStoreInterface {
  chain: string | null
  chainId: number | null
  supportedChainIds: Chain[]
  switchChain: (chain: number) => void
}

export const handleChainSwitching = async (newChain: number, config: Partial<GlobalEnvOption> | null) => {
  const Chain = convertToChain(newChain)
  await buildAndUpdateConfig({ chain: convertToChain(newChain) }, { ...config })

  return { chain: Chain, chainId: Chain.chainId }
}
