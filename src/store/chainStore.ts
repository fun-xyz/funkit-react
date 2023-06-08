import { EnvOption } from "fun-wallet/dist/src/config"
import { Chain } from "fun-wallet/dist/src/data"
import { buildAndUpdateConfig } from "./configureStore"
import { convertToChain } from "../Networks"

export interface ChainStoreInterface {
    chain: string | null
    chainId: number | null
    supportedChainIds: Chain[]
    switchChain: (chain: number) => void
}

export const handleChainSwitching = async (newChain: number, config: Partial<EnvOption> | null) => {
    const Chain = convertToChain(newChain)
    await buildAndUpdateConfig({ chain: convertToChain(newChain) }, { ...config })

    return { chain: Chain, chainId: Chain.chainId }
}
