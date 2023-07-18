import { OAuthProvider } from '@magic-ext/oauth'
import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import { useCallback } from 'react'
import { shallow } from 'zustand/shallow'

import { ConnectorArray, ConnectorTuple } from '../connectors/Types'
import { NoMetaMaskError } from '../store'
import { useFun } from './index'
import { useActiveAccounts } from './UseActiveAccounts'

export const METAMASK = 0
export const COINBASE = 1
export const WALLET_CONNECT = 2
export const OAUTH = 3

const activateConnector = async (
  connector: Connector | ConnectorTuple,
  handleError: (FunError) => void,
  oAuthProvider?: OAuthProvider
) => {
  if (connector == null) return
  const activateFunction = connector['activate'] ?? connector[0].activate
  try {
    if (oAuthProvider) await activateFunction({ oAuthProvider })
    else await activateFunction()
  } catch (err) {
    console.log(err)
    if ((err as any).constructor.name === 'NoMetaMaskError') handleError(NoMetaMaskError)
  }
}

const deactivateConnector = (connector: Connector | ConnectorTuple) => {
  if (connector == null) return
  if (connector['length']) {
    if (connector[0]?.deactivate) {
      void connector[0].deactivate()
    } else {
      void connector[0].resetState()
    }
  } else {
    if (connector['deactivate']) {
      void connector['deactivate']()
    } else {
      void connector['resetState']()
    }
  }
}
const deactivateAllConnectors = async (connectors: ConnectorArray) => {
  for (let i = 0; i < connectors.length; i++) {
    await deactivateConnector(connectors[i])
  }
}

interface IUseConnector {
  index: number // optional index value if passed will only show changes for connectors at that index
}

interface IUseConnectorReturn {
  connector: Connector
  hooks: Web3ReactHooks
  active: boolean
  activating: boolean
  account: string | undefined
  ensName: string | null | undefined
  activate: (connector: Connector | ConnectorTuple, oAuthProvider?: OAuthProvider) => void
  deactivate: (connector: Connector | ConnectorTuple) => void
  deactivateAll: () => void
}

export const useConnector = (args: IUseConnector): IUseConnectorReturn => {
  const { connector, connectors, setTempError } = useFun((state) => {
    return {
      connector: state.connectors[args.index],
      connectors: state.connectors,
      setTempError: state.setTempError,
    }
  }, shallow)

  const { useIsActive, useIsActivating, useAccount, useENSName } = connector[1]

  const isActive = useIsActive()
  const isActivating = useIsActivating()
  const account = useAccount()
  const ensName = useENSName()
  /**
   * Activates a connector.
   * @param connector - The connector to activate.
   * @param oAuthProvider - An optional OAuth provider. string value of 'google' | 'twitter' | 'apple' | 'discord'
   */
  const activateConnectorNow = useCallback(
    (connector, oAuthProvider) => activateConnector(connector, setTempError, oAuthProvider),
    [setTempError]
  )

  const deactivateAllConnectorsNow = useCallback(() => deactivateAllConnectors(connectors), [connectors])

  return {
    connector: connector[0],
    hooks: connector[1],
    active: isActive,
    activating: isActivating,
    account,
    ensName,
    activate: activateConnectorNow,
    deactivate: deactivateConnector,
    deactivateAll: deactivateAllConnectorsNow,
  }
}

export const useConnectors = () => {
  const { connectors, setTempError } = useFun((state) => {
    return {
      connectors: state.connectors,
      setTempError: state.setTempError,
    }
  }, shallow)

  const activeAccounts = useActiveAccounts(connectors)

  const activateConnectorNow = useCallback(
    (connector, oAuthProvider) => activateConnector(connector, setTempError, oAuthProvider),
    [setTempError]
  )
  const deactivateAllConnectorsNow = useCallback(() => deactivateAllConnectors(connectors), [connectors])

  return {
    connectors,
    activeAccounts,
    activate: activateConnectorNow,
    deactivate: deactivateConnector,
    deactivateAll: deactivateAllConnectorsNow,
  }
}
