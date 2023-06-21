// eslint-disable-next-line prettier/prettier
"use client";
import type { Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import {
  Chain,
  configureEnvironment,
  Eoa,
  FunWallet,
  GlobalEnvOption,
  MultiAuthEoa,
  ParameterFormatError,
} from 'fun-wallet'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { connectors } from './connectors'
import { Arbitrum, Goerli, Polygon } from './network/networks'
import {
  createUseFun,
  FunError,
  LegacyAuthIdMultiAccountError,
  MissingActiveSigner,
  MissingApiKeyError,
  MissingConfigError,
  NoMetaMaskError,
} from './store'
import { convertAccountsMultiAuthIds, convertWeb3ProviderToClient, getMatchingHexStrings } from './utils'

export const useFun = createUseFun({
  connectors: [
    connectors.Metamask(),
    connectors.CoinbaseWallet(),
    connectors.WalletConnectV2(),
    connectors.MagicAuthConnection('google'),
    connectors.MagicAuthConnection('twitter'),
    connectors.MagicAuthConnection('apple'),
    connectors.MagicAuthConnection('discord'),
  ],
  supportedChains: [Goerli, Polygon, Arbitrum],
  defaultIndex: 0,
})

export const ShallowEqual = shallow

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

// method for getting the Functions only from the useFun Hook to prevent any updating
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
    initializeSupportedChains(build.config, supportedChains)
    setConfig(build.config)
  }, [config, build, setConfig, handleBuildError, supportedChains])

  const { usePriorityConnector, useSelectedProvider } = getPriorityConnector(
    ...(connections as [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][])
  )

  const activeConnector = usePriorityConnector()
  const activeProvider = useSelectedProvider(activeConnector)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const activeAccountAddresses = connections.map((connector) => connector[1].useAccount())

  const activateConnector = useCallback(
    async (connector: Connector) => {
      if (connector == null) return
      try {
        await connector.activate()
      } catch (err) {
        console.log(err)
        if ((err as any).constructor.name === 'NoMetaMaskError') setTempError(NoMetaMaskError)
      }
    },
    [setTempError]
  )

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
    [initializing, activeProvider, handleBuildError, index, setConfig, setLogin]
  )

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
