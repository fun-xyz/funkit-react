import { Chain } from '@fun-xyz/core'
import { useEffect } from 'react'

import { ConnectorArray } from '../connectors/Types'
import { useFunStoreInterface } from '../store'
import { useFun } from './UseFun'

interface configureFunParams {
  connectors?: ConnectorArray
  supportedChains?: Chain[]
}

export const useConfigureFun = (params: configureFunParams) => {
  const { initializeConnectors, setSupportedChains } = useFun((state: useFunStoreInterface) => ({
    initializeConnectors: state.initializeConnectors,
    setSupportedChains: state.setSupportedChains,
    supportedChains: state.supportedChains,
  }))

  useEffect(() => {
    if (params.connectors == null || params.connectors.length === 0) return
    initializeConnectors(params.connectors)
    if (params.supportedChains == null || params.supportedChains.length === 0) return
    setSupportedChains(params.supportedChains)
  }, [initializeConnectors, params.connectors, params.supportedChains, setSupportedChains])
}
