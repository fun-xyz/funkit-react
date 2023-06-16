// eslint-disable-next-line prettier/prettier
"use client";
import type { Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import { configureEnvironment, Eoa, FunWallet, GlobalEnvOption, MultiAuthEoa } from 'fun-wallet'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { connectors } from './connectors'
import { MISSING_API_KEY, MISSING_CONFIG } from './constants/ErrorMessages'
import { Ethereum, Goerli, Polygon } from './Networks'
import { createUseFun } from './store'
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
  supportedChains: [Goerli, Polygon, Ethereum],
  defaultIndex: 77,
})

export const ShallowEqual = shallow

export interface buildFunWalletInterface {
  config: GlobalEnvOption
}

export interface initializeSingleAuthWalletInterface {
  config?: GlobalEnvOption
  index?: number
  connector?: Connector
}

export interface initializeMultiAuthWalletInterface {
  config?: GlobalEnvOption
  index?: number
  connectorIndexes?: number[]
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
    setLogin,
    setFunError,
    setConfig,
    updateActiveConnectors,
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
      setLogin: state.setLogin,
      setFunError: state.setFunError,
      setConfig: state.setConfig,
      updateActiveConnectors: state.updateActiveConnectors,
    }),
    shallow
  )

  const [initializing, setInitializing] = useState(false)

  //verify and validate the input params
  useEffect(() => {
    if (!build.config) throw new Error(MISSING_CONFIG)
    if (build.config.apiKey === null || build.config.apiKey === '') throw new Error(MISSING_API_KEY)
    if (config) return
    setConfig(build.config)
  }, [config, build, setConfig])

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
        updateActiveConnectors([connector])
      } catch (err) {
        console.log(err)
      }
    },
    [updateActiveConnectors]
  )

  const initializeSingleAuthWallet = useCallback(
    async (singleAuthOpts?: initializeSingleAuthWalletInterface) => {
      if (initializing) return
      setInitializing(true)
      if (singleAuthOpts?.connector && !activeProvider)
        throw new Error('No active provider. activate a connector before calling this function')
      const walletIndex = singleAuthOpts?.index != null ? singleAuthOpts?.index : index
      const clientProvider = singleAuthOpts?.connector?.provider ? singleAuthOpts?.connector.provider : activeProvider
      if (clientProvider == undefined) throw new Error('No provider found')
      const client = convertWeb3ProviderToClient({ provider: clientProvider })
      try {
        if (singleAuthOpts?.config) setConfig(singleAuthOpts.config)

        const ExternalOwnedAccount = new Eoa({ client })
        const generatedUniqueId = await ExternalOwnedAccount.getUniqueId()
        const newFunWallet = new FunWallet({
          uniqueId: generatedUniqueId,
          index: walletIndex,
        })
        const newAccountAddress = await newFunWallet.getAddress()
        setLogin(walletIndex, newAccountAddress, newFunWallet, ExternalOwnedAccount, generatedUniqueId)
        setInitializing(false)
      } catch (err) {
        console.log(err)
        setFunError({ code: 1, message: 'Failed to configure account', err })
        setInitializing(false)
      }
    },
    [initializing, activeProvider, index, setConfig, setLogin, setFunError]
  )

  const initializeMultiAuthWallet = useCallback(
    async (singleAuthOpts?: initializeMultiAuthWalletInterface) => {
      if (initializing) return
      setInitializing(true)
      if (!activeProvider) throw new Error('No active provider. activate a connector before calling this function')
      // Validate the input params
      const walletIndex = singleAuthOpts?.index != null ? singleAuthOpts?.index : index
      const clientProvider =
        singleAuthOpts?.connectorIndexes && singleAuthOpts.connectorIndexes.length > 0
          ? connections[singleAuthOpts.connectorIndexes[0]][0].provider
          : activeProvider
      if (clientProvider == undefined) throw new Error('No provider found')
      const client = convertWeb3ProviderToClient({ provider: clientProvider })
      const currentConfig = singleAuthOpts?.config ? singleAuthOpts.config : config
      try {
        if (!currentConfig) throw new Error('Environment config not set')
        if (currentConfig !== config) {
          setConfig(currentConfig)
        }
        await configureEnvironment(currentConfig)
        const accountsToUse = getMatchingHexStrings(activeAccountAddresses, singleAuthOpts?.connectorIndexes)
        const multiAuthIds = (await convertAccountsMultiAuthIds(accountsToUse as string[])) as [] // get this typed better since i cheated NT
        // initialize the wallet
        console.log(accountsToUse, multiAuthIds, singleAuthOpts?.connectorIndexes)
        const ExternalOwnedAccount = new MultiAuthEoa({ client, authIds: multiAuthIds })
        const generatedUniqueId = await ExternalOwnedAccount.getUniqueId()
        const newFunWallet = new FunWallet({
          uniqueId: generatedUniqueId,
          index: walletIndex,
        })
        const newAccountAddress = await newFunWallet.getAddress()
        setLogin(walletIndex, newAccountAddress, newFunWallet, ExternalOwnedAccount, generatedUniqueId)
        setInitializing(false)
      } catch (err) {
        console.log(err)
        setFunError({ code: 1, message: 'Failed to configure account', err })
        setInitializing(false)
      }
    },
    [activeAccountAddresses, activeProvider, config, index, initializing, setConfig, setFunError, setLogin]
  )

  return {
    useFun,
    connectors: connections,
    activeConnector,
    activeAccountAddresses,
    index,
    FunWallet: storedFunWallet,
    Eoa: Authorizer,
    uniqueId,
    account,
    error,
    loading: initializing,
    activateConnector,
    initializeSingleAuthWallet,
    initializeMultiAuthWallet,
  }
}

// how to go from Provider to fun wallet
