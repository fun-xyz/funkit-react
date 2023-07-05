import { configureEnvironment, GlobalEnvOption } from '@fun-xyz/core'

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
  return { config: finalConfig }
}

export const setConfig = async (newConfig: Partial<GlobalEnvOption>) => {
  await configureEnvironment(newConfig as GlobalEnvOption)
  return { config: newConfig }
}
