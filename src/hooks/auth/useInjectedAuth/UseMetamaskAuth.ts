import { authHookReturn } from '../types'
import { useInjectedAuth } from './UseInjectedAuth'

export const useMetamaskAuth = (autoConnect = false): authHookReturn => {
  return useInjectedAuth({ name: 'MetaMask', autoConnect })
}
