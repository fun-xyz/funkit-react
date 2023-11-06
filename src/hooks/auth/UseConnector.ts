import { OAuthProvider } from '@magic-ext/oauth'
import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { FunLogger } from '@/utils/Logger'

import { ConnectorArray, ConnectorTuple } from '../../connectors/Types'
import { NoMetaMaskError } from '../../store'
import { FunError } from '../../store/plugins/ErrorStore'
import { useFun } from '../index'
import { connectors } from '../util/UseActiveClients'
import { usePrimaryConnector } from '../util/UsePrimaryConnector'

const logger = new FunLogger()

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
    logger.error('UseConnector_activateConnector_error', err)
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
  options: any // optional options to pass to the connector
}

interface IUseConnectorReturn {
  connector: Connector
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

/**
 * @deprecated This function is deprecated and will be removed in future versions. Please use useConnectorWithAccount instead.
 * @param args - The arguments object.
 * @param args.index - The index of the connector to use.
 * @param args.autoConnect - Whether to automatically connect to the connector.
 * @param args.options - The options to pass to the connector.
 * @returns An object containing the connector, hooks, and various properties and functions related to the connector.
 */
export const useConnector = (args: IUseConnector): IUseConnectorReturn => {
  const { useIsActive, useIsActivating, useAccount, useProvider, useENSNames, useChainId } = connectors[args.index][1]

  const isActive = useIsActive()
  const isActivating = useIsActivating()
  const chainId = useChainId()
  const account = useAccount()
  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState<FunError | null>(null)

  useEffect(() => {
    if (!args.autoConnect) return
    const connectPromise = connectors[args.index][0].connectEagerly(args.options)
    if (connectPromise && typeof connectPromise.catch === 'function') {
      connectPromise.catch(() => {
        logger.debug(`Failed to connect eagerly`)
      })
    }
  }, [args.autoConnect, args.index, args.options])

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
    connector: connectors[args.index][0],
    hooks: connectors[args.index][1],
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
  activeConnectors: { active: boolean; account: string | undefined }[]
  primaryConnector: Connector
  activate: (connector: Connector | ConnectorTuple, oAuthProvider?: OAuthProvider) => void
  deactivate: (connector: Connector | ConnectorTuple) => void
  deactivateAll: () => void
}
/**
 * @deprecated This function is deprecated and will be removed in future versions. Please use useConnectorWithAccount instead.
 * @param args - The arguments object.
 * @param args.autoConnect - Whether to automatically connect to the connector.
 * @returns An object containing the connector, hooks, and various properties and functions related to the connector.
 */
export const useConnectors = (args: IUseConnectors): IUseConnectorsReturn => {
  const { setTempError } = useFun((state) => {
    return {
      setTempError: state.setTempError,
    }
  }, shallow)

  const activeConnector = usePrimaryConnector()
  const [autoConnect, setAutoConnect] = useState(args?.autoConnect || false)

  useEffect(() => {
    if (!autoConnect) return
    connectors.map((connector) => {
      const connectPromise = connector[0].connectEagerly({
        appName: 'FunKit',
        url: 'https://funkit.app',
        projectId: 'funkit',
        showQrModal: true,
      })
      if (connectPromise && typeof connectPromise.catch === 'function') {
        connectPromise.catch(() => {
          logger.debug(`Failed to connect eagerly to ${connector[0].constructor.name}`)
        })
      }
    })
    setAutoConnect(false)
  }, [autoConnect])

  const activeConnectors = connectors.map((connector) => {
    const active = connector[1].useIsActive()
    const account = connector[1].useAccount()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return { active, account }
  })

  const activateConnectorNow = useCallback(
    (connector, oAuthProvider) => activateConnector(connector, setTempError, oAuthProvider),
    [setTempError]
  )
  const deactivateAllConnectorsNow = useCallback(() => deactivateAllConnectors(connectors), [])

  return {
    connectors,
    activeConnectors,
    primaryConnector: activeConnector ? activeConnector[0] : connectors[CONNECTOR_BY_NAME.METAMASK][0],
    activate: activateConnectorNow,
    deactivate: deactivateConnector,
    deactivateAll: deactivateAllConnectorsNow,
  }
}
