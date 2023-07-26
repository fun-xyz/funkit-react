import { useRef } from 'react'
import { pad } from 'viem'
import { shallow } from 'zustand/shallow'

import { useGetName } from '../../connectors'
import { useFun } from '../UseFun'

export interface IActiveAuthList {
  active: boolean
  name: string
  account: string
  provider: any
  userId: (Uint8Array | `0x${string}`) | undefined
}
// hook which returns the active state of all the connectors
export const useActiveClients = (): IActiveAuthList[] => {
  const { connectors } = useFun((state) => ({ connectors: state.connectors }), shallow)

  const activeConnectors = connectors.map((connector) => {
    const provider = connector[1].useProvider()
    const active = connector[1].useIsActive()
    const account = connector[1].useAccount()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const name = useGetName(connector[0])

    let userId: (Uint8Array | `0x${string}`) | undefined = undefined
    if (account) userId = pad(account, { size: 32 })
    return {
      active,
      name,
      account,
      provider,
      userId,
    }
  })

  const oldConnectors = useRef<IActiveAuthList[]>([])
  if (oldConnectors.current.length === activeConnectors.length) {
    // check if any accounts have changed.
    for (let i = 0; i < activeConnectors.length; i++) {
      const currentConnector = activeConnectors[i]
      const oldConnector = oldConnectors.current[i]
      if (currentConnector.account !== oldConnector.account) {
        oldConnectors.current = activeConnectors
        return activeConnectors
      }
    }
  } else {
    oldConnectors.current = activeConnectors
    return activeConnectors
  }

  return oldConnectors.current
}
