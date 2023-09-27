import { OAuthProvider } from '@magic-ext/oauth'
import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { useGetName } from '../..'
import { ConnectorArray, ConnectorTuple } from '../../connectors/Types'
import { NoMetaMaskError } from '../../store'
import { FunError } from '../../store/plugins/ErrorStore'
import { useFun } from '../index'
import { usePrimaryConnector } from '../util/UsePrimaryConnector'

export enum CONNECTOR_BY_NAME {
  METAMASK = 0,
  COINBASE = 1,
  WALLET_CONNECT = 2,
  OAUTH = 3,
}

const activateConnector = async (
  connector: Connector,
  handleError: (FunError) => void,
  oAuthProvider?: OAuthProvider
) => {
  if (connector == null) return
  try {
    if (oAuthProvider) await connector.activate({ oAuthProvider })
    else await connector.activate()
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

export const deactivateAllConnectors = async (connectors: ConnectorArray) => {
  for (let i = 0; i < connectors.length; i++) {
    await deactivateConnector(connectors[i])
  }
}

interface IUseConnector {
  index: number // optional index value if passed will only show changes for connectors at that index
  autoConnect?: boolean // optional if true the connector will try and automatically activate. default is false
}

interface IUseConnectorReturn {
  connector: Connector
  connectorName: string
  hooks: Web3ReactHooks
  active: boolean
  activating: boolean
  account: string | undefined
  chainId: number | undefined
  ensNames: undefined[] | (string | null)[]
  provider: any
  error: FunError | null
  setError: (error: FunError | null) => void
  activate: (connector: Connector | ConnectorTuple, oAuthProvider?: OAuthProvider) => void
  deactivate: (connector: Connector | ConnectorTuple) => void
}

export const useConnector = (args: IUseConnector): IUseConnectorReturn => {
  const { connector } = useFun((state) => {
    return {
      connector: state.connectors[args.index],
    }
  }, shallow)

  const { useIsActive, useIsActivating, useAccount, useProvider, useENSNames, useChainId } = connector[1]

  const isActive = useIsActive()
  const isActivating = useIsActivating()
  const chainId = useChainId()
  const account = useAccount()
  const provider = useProvider()
  const ENSNames = useENSNames(provider)
  const connectorName = useGetName(connector[0])

  const [error, setError] = useState<FunError | null>(null)

  useEffect(() => {
    if (!args.autoConnect) return
    if (!connector || !connector[0].connectEagerly) return
    const connectPromise = connector[0].connectEagerly()
    if (connectPromise && typeof connectPromise.catch === 'function') {
      connectPromise.catch(() => {
        console.debug(`Failed to connect eagerly to ${connectorName}`)
      })
    }
  }, [args.autoConnect, connector, connectorName])

  /**
   * Activates a connector.
   * @param connector - The connector to activate.
   * @param oAuthProvider - An optional OAuth provider. string value of 'google' | 'twitter' | 'apple' | 'discord'
   */
  const activateConnectorNow = useCallback(
    (connector, oAuthProvider) => activateConnector(connector, setError, oAuthProvider),
    []
  )

  return {
    connector: connector[0],
    connectorName,
    hooks: connector[1],
    active: isActive,
    activating: isActivating,
    chainId,
    account,
    ensNames: ENSNames,
    provider,
    error,
    setError,
    activate: activateConnectorNow,
    deactivate: deactivateConnector,
  }
}

export interface IUseConnectors {
  autoConnect?: boolean
}
export interface IUseConnectorsReturn {
  connectors: ConnectorArray
  activeConnectors: { active: boolean; name: string; account: string | undefined }[]
  primaryConnector: Connector
  activate: (connector: Connector | ConnectorTuple, oAuthProvider?: OAuthProvider) => void
  deactivate: (connector: Connector | ConnectorTuple) => void
  deactivateAll: () => void
}

export const useConnectors = (args: IUseConnectors): IUseConnectorsReturn => {
  const { connectors, setTempError } = useFun((state) => {
    return {
      connectors: state.connectors,
      setTempError: state.setTempError,
    }
  }, shallow)

  const activeConnector = usePrimaryConnector()
  const [autoConnect, setAutoConnect] = useState(args?.autoConnect || false)

  useEffect(() => {
    if (!autoConnect) return
    connectors.map((connector) => {
      if (connector[0].connectEagerly) {
        const connectPromise = connector[0].connectEagerly()
        if (connectPromise && typeof connectPromise.catch === 'function') {
          connectPromise.catch(() => {
            console.debug(`Failed to connect eagerly to ${connector[0].constructor.name}`)
          })
        }
      }
    })
    setAutoConnect(false)
  }, [autoConnect, connectors])

  const activeConnectors = connectors.map((connector) => {
    const active = connector[1].useIsActive()
    const account = connector[1].useAccount()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const name = useGetName(connector[0])

    return { active, name, account }
  })

  const activateConnectorNow = useCallback(
    (connector, oAuthProvider) => activateConnector(connector, setTempError, oAuthProvider),
    [setTempError]
  )
  const deactivateAllConnectorsNow = useCallback(() => deactivateAllConnectors(connectors), [connectors])

  return {
    connectors,
    activeConnectors,
    primaryConnector: activeConnector.connector,
    activate: activateConnectorNow,
    deactivate: deactivateConnector,
    deactivateAll: deactivateAllConnectorsNow,
  }
}
