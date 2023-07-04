import {
  Chain,
  configureEnvironment,
  Eoa,
  FunWallet,
  GlobalEnvOption,
  MultiAuthEoa,
  ParameterFormatError,
} from '@fun-xyz/core'
import { OAuthProvider } from '@magic-ext/oauth'
import type { Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  FunError,
  LegacyAuthIdMultiAccountError,
  MissingActiveSigner,
  MissingApiKeyError,
  MissingConfigError,
  NoMetaMaskError,
} from '../store'
import { convertAccountsMultiAuthIds, convertWeb3ProviderToClient, getMatchingHexStrings } from '../utils'
import { useFun } from './index'

export interface buildFunWalletInterface {
  config: GlobalEnvOption
}

export interface initializeSingleAuthWalletInterface {
  config?: GlobalEnvOption
  index?: number
  connectorIndex?: number
}

export interface initializeMultiAuthWalletInterface {
  config?: GlobalEnvOption
  index?: number
  connectorIndexes?: number[]
}

const initializeSupportedChains = async (config: GlobalEnvOption, supportedChains: Chain[]) => {
  try {
    await configureEnvironment(config)
    supportedChains.forEach(async (chain) => await chain.init())
  } catch (error) {
    console.log(error)
  }
}

/**
 *
 * @param build
 * @param build.config GlobalEnvOption
 * @returns { connectors, activeAccountAddresses, index, FunWallet, Eoa, uniqueId, account, chainId, error, loading, resetFunError, activateConnector, initializeSingleAuthWallet, initializeMultiAuthWallet }
 */
export const useBuildFunWallet = (build: buildFunWalletInterface) => {
  const {
    connections,
    index,
    storedFunWallet,
    Authorizer,
    uniqueId,
    account,
    error,
    config,
    supportedChains,
    setLogin,
    setFunError,
    setTempError,
    resetFunError,
    setConfig,
  } = useFun(
    (state) => ({
      connections: state.connectors,
      index: state.index,
      storedFunWallet: state.FunWallet,
      Authorizer: state.Eoa,
      uniqueId: state.uniqueId,
      account: state.account,
      error: state.error,
      config: state.config,
      supportedChains: state.supportedChains,
      setLogin: state.setLogin,
      setFunError: state.setFunError,
      setTempError: state.setTempError,
      resetFunError: state.resetFunError,
      setConfig: state.setConfig,
    }),
    shallow
  )

  const [initializing, setInitializing] = useState(false)

  const handleBuildError = useCallback(
    (error: FunError) => {
      setTempError(error)
      setInitializing(false)
    },
    [setTempError, setInitializing]
  )
  //verify and validate the input params
  useEffect(() => {
    if (!build.config) handleBuildError(MissingConfigError)
    if (build.config.apiKey === null || build.config.apiKey === '') handleBuildError(MissingApiKeyError)
    if (config) return
    initializeSupportedChains(build.config, supportedChains) // TODO analyze the cost of building the supported chains rather then just the one we are using
    setConfig(build.config)
  }, [config, build, setConfig, handleBuildError, supportedChains])

  const { usePriorityConnector, useSelectedProvider } = getPriorityConnector(
    ...(connections as [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][])
  )

  const activeConnector = usePriorityConnector()
  const activeProvider = useSelectedProvider(activeConnector)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const activeAccountAddresses = connections.map((connector) => connector[1].useAccount())

  /**
   * Activates a connector.
   * @param connector - The connector to activate.
   * @param oAuthProvider - An optional OAuth provider. string value of 'google' | 'twitter' | 'apple' | 'discord'
   */
  const activateConnector = useCallback(
    async (connector: Connector, oAuthProvider?: OAuthProvider) => {
      if (connector == null) return
      try {
        if (oAuthProvider) await connector.activate({ oAuthProvider })
        else await connector.activate()
      } catch (err) {
        console.log(err)
        if ((err as any).constructor.name === 'NoMetaMaskError') setTempError(NoMetaMaskError)
      }
    },
    [setTempError]
  )

  /**
   * Initializes a single auth wallet. using the connectorIndex will use the connector at that index in the connections array.
   * Connector indexes are deterministic and should not change. Use the connectorIndexUtil to get the index of a connector from its name.
   * @param singleAuthOpts - An optional object containing the connectorIndex and/or the index of the wallet to initialize.
   * @param singleAuthOpts.connectorIndex - The index of the connector to use. if none is provided it will use the first active connector starting from 0.
   * @param singleAuthOpts.index - The index of the wallet to initialize. default is 0.
   * @param singleAuthOpts.config - An optional config to use for this wallet.
   * @returns Can only return errors. Typically results are read from the async funStore.
   */
  const initializeSingleAuthWallet = useCallback(
    async (singleAuthOpts?: initializeSingleAuthWalletInterface) => {
      if (initializing) return
      setInitializing(true)
      const clientProvider =
        singleAuthOpts?.connectorIndex != null
          ? connections[singleAuthOpts?.connectorIndex][0].provider
          : activeProvider
      if (clientProvider == null) return handleBuildError(MissingActiveSigner)

      const walletIndex = singleAuthOpts?.index ?? index
      const client = convertWeb3ProviderToClient({ provider: clientProvider })

      try {
        if (singleAuthOpts?.config) setConfig(singleAuthOpts.config)

        const externalOwnedAccount = new Eoa({ client })
        const generatedUniqueId = await externalOwnedAccount.getUniqueId()
        const newFunWallet = new FunWallet({
          uniqueId: generatedUniqueId,
          index: walletIndex,
        })
        const newAccountAddress = await newFunWallet.getAddress()

        setLogin(walletIndex, newAccountAddress, newFunWallet, externalOwnedAccount, generatedUniqueId)
        setInitializing(false)
      } catch (err) {
        console.log('Single Signer Error: ', err, client, singleAuthOpts)
        return handleBuildError({
          code: 0,
          message: 'Failed to configure account',
          err,
        })
      }
    },
    [initializing, connections, activeProvider, handleBuildError, index, setConfig, setLogin]
  )

  /**
   * Initializes a multi auth wallet. using the connectorIndexes will use the connectors at those indexes in the connections array.
   * Connector indexes are deterministic and should not change. Use the connectorIndexUtil to get the index of a connector from its name.
   * @param multiAuthInputs - An optional object containing the connectorIndexes and/or the index of the wallet to initialize.
   * @param multiAuthInputs.connectorIndexes - The indexes of the connectors to use. if none are provided it will use the first active connector starting from 0.
   * @param multiAuthInputs.index - The index of the wallet to initialize. default is 0.
   * @param multiAuthInputs.config - An optional config to use for this wallet.
   * @returns Can only return errors. Typically results are read from the async funStore.
   */
  const initializeMultiAuthWallet = useCallback(
    async (multiAuthInputs?: initializeMultiAuthWalletInterface) => {
      if (initializing) return
      setInitializing(true)
      // Validate the input params
      const clientProvider =
        multiAuthInputs?.connectorIndexes && multiAuthInputs.connectorIndexes.length > 0
          ? connections[multiAuthInputs.connectorIndexes[0]][0].provider
          : activeProvider
      if (!clientProvider) return handleBuildError(MissingActiveSigner)

      const walletIndex = multiAuthInputs?.index ?? index
      const client = convertWeb3ProviderToClient({ provider: clientProvider })
      try {
        const currentConfig = multiAuthInputs?.config ?? config
        if (!currentConfig) return handleBuildError(MissingConfigError)
        if (currentConfig !== config) setConfig(currentConfig)
        await configureEnvironment(currentConfig)

        // get the accounts
        const accountsToUse = getMatchingHexStrings(activeAccountAddresses, multiAuthInputs?.connectorIndexes)
        const multiAuthIds = convertAccountsMultiAuthIds(accountsToUse as string[]) as [] // get this typed better since i cheated NT
        // initialize the wallet
        const externalOwnedAccount = new MultiAuthEoa({
          client,
          authIds: multiAuthIds,
        })
        const generatedUniqueId = await externalOwnedAccount.getUniqueId()
        const newFunWallet = new FunWallet({
          uniqueId: generatedUniqueId,
          index: walletIndex,
        })
        const newAccountAddress = await newFunWallet.getAddress()
        setLogin(walletIndex, newAccountAddress, newFunWallet, externalOwnedAccount, generatedUniqueId)
        setInitializing(false)
      } catch (err) {
        console.log('Multi Signer Error: ', err)
        if ((err as object) instanceof ParameterFormatError) return handleBuildError(LegacyAuthIdMultiAccountError)
        handleBuildError({
          code: 0,
          message: 'Failed to configure account',
          err,
        })
      }
    },
    [
      activeAccountAddresses,
      activeProvider,
      config,
      connections,
      handleBuildError,
      index,
      initializing,
      setConfig,
      setLogin,
    ]
  )

  return {
    connectors: connections,
    activeAccountAddresses,
    index,
    FunWallet: storedFunWallet,
    Eoa: Authorizer,
    uniqueId,
    account,
    chainId: config?.chain instanceof Chain ? config?.chain : new Chain({ chainId: config?.chain.toString() }),
    error,
    loading: initializing,
    resetFunError,
    activateConnector,
    initializeSingleAuthWallet,
    initializeMultiAuthWallet,
  }
}
