import { EnvOption, configureEnvironment } from "fun-wallet/dist/src/config"

export interface ConfigureStoreInterface {
    config: EnvOption | null
    setConfig: (Config: Partial<EnvOption>) => void
}

export const buildAndUpdateConfig = async (newConfig: Partial<EnvOption>, oldConfig: Partial<EnvOption>) => {
    const finalConfig = {
        ...oldConfig,
        ...newConfig
    }
    await configureEnvironment(finalConfig)
    return { config: finalConfig }
}
