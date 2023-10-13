/* eslint-disable react-hooks/rules-of-hooks */
import { Auth } from '@funkit/core'

import { InjectedConnector } from '../../connectors/MetaMask'
import { IActiveAuthList } from '../../store/plugins/FunAuthStore'
import { convertToValidUserId } from '../../utils'
import { CoinbaseWalletConnector } from '../auth/UseCoinbaseAuth'

const connectors = [InjectedConnector, CoinbaseWalletConnector]

export const useActiveClients = (): IActiveAuthList[] => {
  const activeConnectors = connectors.map(([, hooks]) => {
    const { useAccount, useIsActive, useProvider } = hooks
    const account: string = useAccount() ?? ''
    const active: boolean = useIsActive()
    const provider = useProvider()
    if (active)
      return {
        active,
        name: '',
        account,
        provider,
        userId: convertToValidUserId(account),
        auth: provider ? new Auth({ provider }) : undefined,
      }
    return null
  })

  return activeConnectors.filter((item) => item !== null) as IActiveAuthList[]
}
