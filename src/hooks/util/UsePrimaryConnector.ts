import type { Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import { shallow } from 'zustand/shallow'

import { useFun } from '../UseFun'

export const usePrimaryConnector = () => {
  const { connectors } = useFun((state) => {
    return {
      connectors: state.connectors,
    }
  }, shallow)

  const { usePriorityConnector, usePriorityProvider } = getPriorityConnector(
    ...(connectors as [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][])
  )

  return {
    connector: usePriorityConnector(),
    provider: usePriorityProvider(),
  }
}
