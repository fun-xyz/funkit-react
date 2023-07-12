import { Chain, GlobalEnvOption } from '@fun-xyz/core'

import { convertToChain } from '../../network/Networks'
import { buildAndUpdateConfig } from './ConfigureStore'

export interface ChainStoreInterface {
  chain: string | null
  chainId: number | null
  supportedChains: Chain[]
  setSupportedChains: (chains: Chain[]) => void
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

export const configureChainStore = (supportedChains: Chain[], get: any, set: any): ChainStoreInterface => ({
  chain: null,
  chainId: null,
  supportedChains,
  setSupportedChains: (chains: Chain[]) => set({ supportedChains: chains }),
  switchChain: async (chainId: number | string) => {
    const { config: oldConfig, account: oldAccount, FunWallet: funWallet } = get()
    const newState = await handleChainSwitching(chainId, oldConfig)
    set(newState)
    const newAccount = funWallet?.getAddress()
    if (oldAccount !== newAccount) {
      set({ account: newAccount })
    }
  },
})
