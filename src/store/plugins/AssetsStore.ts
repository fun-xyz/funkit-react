import { GlobalEnvOption } from '@fun-xyz/core'

import { convertToChain } from '../../network/Networks'
import { buildAndUpdateConfig } from './ConfigureStore'

export interface AssetStoreInterface {
  asset: object | null
}

export const handleChainSwitching = async (newChain: number | string, oldConfig: Partial<GlobalEnvOption> | null) => {
  const Chain = convertToChain(newChain)
  if (!Chain) {
    throw new Error(`Invalid Chain: ${newChain}`)
  }
  const { config } = await buildAndUpdateConfig({ chain: Chain }, { ...oldConfig })

  return { chain: Chain, chainId: Chain.chainId, config }
}
