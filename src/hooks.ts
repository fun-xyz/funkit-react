// eslint-disable-next-line prettier/prettier
"use client";
import type { Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import { configureEnvironment, EnvOption, Eoa, FunWallet } from 'fun-wallet'
import { useCallback } from 'react'
import { shallow } from 'zustand/shallow'

import { connectors } from './connectors'
import { Ethereum, Goerli, Polygon } from './Networks'
import { createUseFun, createUseFunInterface } from './store'

export const useFun = createUseFun({
  connectors: [
    connectors.Metamask(),
    connectors.CoinbaseWallet(),
    connectors.WalletConnectV2(),
    connectors.GoogleAuthConnector(),
  ],
  supportedChains: [Goerli, Polygon, Ethereum],
  defaultIndex: 77,
})

export const ShallowEqual = shallow

// method for getting the Functions only from the useFun Hook to prevent any updating
export const useBuildFunWallet = (build?: createUseFunInterface) => {
  if (build) console.log(build)
  const { connections, index, storedFunWallet, Authorizer, uniqueId, account, error, setLogin, setFunError } = useFun(
    (state) => ({
      connections: state.connectors,
      activeConnectors: state.activeConnectors,
      index: state.index,
      storedFunWallet: state.FunWallet,
      Authorizer: state.Eoa,
      uniqueId: state.uniqueId,
      account: state.account,
      error: state.error,
      setLogin: state.setLogin,
      setFunError: state.setFunError,
    }),
    shallow
  )

  const { usePriorityConnector, useSelectedProvider } = getPriorityConnector(
    ...(connections as [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][])
  )

  const activeConnector = usePriorityConnector()
  const activeProvider = useSelectedProvider(activeConnector)

  // TODO prevent this function from being run more than once
  const initializeSingleAuthWallet = useCallback(
    async (config: EnvOption, index: number) => {
      console.log(activeProvider)
      if (!activeProvider) return

      try {
        console.log(config)
        await configureEnvironment(config)
        const signer = activeProvider?.getSigner()
        const ExternalOwnedAccount = new Eoa({ signer })
        const generatedUniqueId = await ExternalOwnedAccount.getUniqueId()
        const newFunWallet = new FunWallet({ uniqueId: generatedUniqueId, index })
        const newAccountAddress = await newFunWallet.getAddress()
        console.log('setting account logged in')
        setLogin(config, index, newAccountAddress, newFunWallet, ExternalOwnedAccount, generatedUniqueId)
      } catch (err) {
        console.log(err)
        setFunError({ code: 1, message: 'Failed to configure account', err })
      }
    },
    [activeProvider, setFunError, setLogin]
  )

  return {
    useFun,
    connectors: connections,
    activeConnector,
    index,
    FunWallet: storedFunWallet,
    Eoa: Authorizer,
    uniqueId,
    account,
    error,
    initializeSingleAuthWallet,
  }
}

// how to go from Provider to fun wallet
