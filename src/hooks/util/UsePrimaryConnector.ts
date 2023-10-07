import { shallow } from 'zustand/shallow'

import { useFun } from '../UseFun'

export const usePrimaryConnector = () => {
  const { activeAuthList } = useFun((state) => {
    return {
      activeAuthList: state.activeAuthClients,
    }
  }, shallow)

  if (activeAuthList.length === 0) return null
  return activeAuthList[0]
}
