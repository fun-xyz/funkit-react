import { Chain, GlobalEnvOption } from '@funkit/core'

import { convertToChain } from '../../network/Networks'
import { buildAndUpdateConfig } from './ConfigureStore'
import { generateTransactionError, SwitchChainError } from './ErrorStore'

export interface ChainStoreInterface {
  chain: Chain | null
  chainId: number | null
  supportedChains: (number | string)[]
  setSupportedChains: (chains: (number | string)[]) => void
  switchChain: (chain: number | string) => void
  initializeChainStore: (chain: number | string | Chain) => void
}

export const handleChainSwitching = async (newChain: number | string, oldConfig: Partial<GlobalEnvOption> | null) => {
  const Chain = await convertToChain(newChain)
  const { config } = await buildAndUpdateConfig({ chain: Chain }, { ...oldConfig })
  return { chain: Chain, chainId: await Chain.getChainId(), config }
}

export const configureChainStore = (get: any, set: any): ChainStoreInterface => ({
  chain: null,
  chainId: null,
  supportedChains: [],
  setSupportedChains: (chains: (number | string)[]) => set({ supportedChains: chains }),
  switchChain: async (chainId: number | string) => {
    const { config: oldConfig } = get()
    try {
      const newState = await handleChainSwitching(chainId, oldConfig)
      set(newState)
    } catch (error) {
      console.log(error)
      set({
        error: generateTransactionError(
          SwitchChainError,
          {
            oldChain: oldConfig?.chain,
            chainId,
          },
          error
        ),
      })
    }
  },
  initializeChainStore: async (chain: number | string | Chain) => {
    if (typeof chain === 'number' || typeof chain === 'string') {
      const chainClass = await convertToChain(chain)
      set({ chain: chainClass, chainId: chain })
    }
  },
})
