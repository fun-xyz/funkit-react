import { useFunStoreInterface } from '../../store'
import { ShallowEqual, useFun } from '../UseFun'

export const useNetwork = () => {
  const { Chain, chainId, SwitchChain, supportedChains } = useFun(
    (state: useFunStoreInterface) => ({
      Chain: state.chain,
      chainId: state.chainId,
      SwitchChain: state.switchChain,
      supportedChains: state.supportedChains,
    }),
    ShallowEqual
  )

  return {
    Chain,
    chainId,
    SwitchChain,
    supportedChains,
  }
}
