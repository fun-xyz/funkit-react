import { configureEnvironment, EnvOption } from 'fun-wallet'

export interface ConfigureStoreInterface {
  config: EnvOption | null
  setConfig: (Config: Partial<EnvOption>) => void
  updateConfig: (Config: Partial<EnvOption>) => void
}

export const buildAndUpdateConfig = async (newConfig: Partial<EnvOption>, oldConfig: Partial<EnvOption>) => {
  const finalConfig = {
    ...oldConfig,
    ...newConfig,
  }
  await configureEnvironment(finalConfig as EnvOption)
  return { config: finalConfig }
}

export const setConfig = async (newConfig: Partial<EnvOption>) => {
  await configureEnvironment(newConfig as EnvOption)
  return { config: newConfig }
}
