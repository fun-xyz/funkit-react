/* eslint-disable react-hooks/rules-of-hooks */
import { Auth } from '@funkit/core'

import { InjectedConnector } from '../../connectors/MetaMask'
import { IActiveAuthList } from '../../store/plugins/FunAuthStore'
import { convertToValidUserId } from '../../utils'
import { usePrivyAuth } from '../auth'
import { CoinbaseWalletConnector } from '../auth/UseCoinbaseAuth'
import { SocialAuthConnector } from '../auth/useSocialAuth/UseSocialAuthBase'
import { WalletConnectConnector } from '../auth/UseWalletConnectAuth'

const connectors = [InjectedConnector, CoinbaseWalletConnector, WalletConnectConnector, SocialAuthConnector]

export const useActiveClients = (): IActiveAuthList[] => {
  const { active, auth, authAddr } = usePrivyAuth(true)

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
  }) as IActiveAuthList[]
  if (active && authAddr && auth) {
    const privyAuth: IActiveAuthList = {
      active,
      name: 'Privy',
      account: authAddr,
      provider: auth.client,
      userId: convertToValidUserId(authAddr),
      auth,
    }
    activeConnectors.push(privyAuth)
  }
  return activeConnectors.filter((item) => item !== null) as IActiveAuthList[]
}
