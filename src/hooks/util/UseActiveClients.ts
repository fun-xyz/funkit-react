import { shallow } from 'zustand/shallow'

import { IActiveAuthList } from '@/store/plugins/FunAuthStore'

import { useFun } from '../UseFun'

// hook which returns the active state of all the connectors
export const useActiveClients = (): IActiveAuthList[] => {
  const { activeConnectors } = useFun((state) => ({ activeConnectors: state.activeAuthClients }), shallow)
  return activeConnectors
}
