import { configureEnvironment, GlobalEnvOption } from '@funkit/core'

import { logger } from '../../utils/Logger'

export interface ConfigureStoreInterface {
  config: GlobalEnvOption | null
  setConfig: (Config: Partial<GlobalEnvOption>) => void
  updateConfig: (Config: Partial<GlobalEnvOption>) => void
}

export const buildAndUpdateConfig = async (
  newConfig: Partial<GlobalEnvOption>,
  oldConfig: Partial<GlobalEnvOption>
) => {
  const finalConfig = {
    ...oldConfig,
    ...newConfig,
  }
  await configureEnvironment(finalConfig as GlobalEnvOption)
  logger.setFunApiKey(finalConfig.apiKey || null)
  return { config: finalConfig }
}

export const setConfig = async (newConfig: Partial<GlobalEnvOption>) => {
  logger.setFunApiKey(newConfig.apiKey || null)
  await configureEnvironment(newConfig as GlobalEnvOption)
  return { config: newConfig }
}

export const configureConfigurationStore = (
  get: () => ConfigureStoreInterface,
  set: (newValue: any) => void
): ConfigureStoreInterface => ({
  config: null,
  updateConfig: async (newConfig: any) => {
    const oldConfig = get().config
    const update = await buildAndUpdateConfig(newConfig, oldConfig || {})
    return set(update)
  },
  setConfig: async (newConfig: any) => {
    return set(await setConfig(newConfig))
  },
})
