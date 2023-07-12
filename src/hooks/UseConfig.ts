import { useFunStoreInterface } from '../store'
import { ShallowEqual, useFun } from './UseFun'

export const useConfig = () => {
  const { config, setConfig, updateConfig } = useFun(
    (state: useFunStoreInterface) => ({
      config: state.config,
      setConfig: state.setConfig,
      updateConfig: state.updateConfig,
    }),
    ShallowEqual
  )

  return {
    config,
    setConfig,
    updateConfig,
  }
}
