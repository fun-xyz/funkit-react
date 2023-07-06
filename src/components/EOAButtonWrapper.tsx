import React, { useEffect } from 'react'

interface EOAButtonWrapper {
  connector: any
  children: JSX.Element
  props: any
}
const EOAButtonWrapper = ({ connector, children, props }: EOAButtonWrapper): React.ReactNode => {
  const Connector = connector[0]
  const Hooks = connector[1]
  const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = Hooks
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (!Connector || !Connector.connectEagerly) return
    const connectPromise = Connector.connectEagerly()
    if (connectPromise && typeof connectPromise.catch === 'function') {
      connectPromise.catch(() => {
        console.debug('Failed to connect eagerly to Connector')
      })
    }
  }, [Connector])

  return (
    <div>{React.cloneElement(children, { chainId, accounts, isActivating, isActive, provider, ENSNames, props })}</div>
  )
}

export default EOAButtonWrapper
