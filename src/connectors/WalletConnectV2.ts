import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

const WalletConnectV2Connector = (chains = [1, 137, 42161], appName = '84012e566d88d63119afe996d7b327bc') => {
  return initializeConnector<WalletConnectV2>(
    (actions) =>
      new WalletConnectV2({
        actions,
        options: {
          projectId: appName,
          chains,
          showQrModal: true,
        },
      })
  )
}

export const [walletConnectV2, hooks] = WalletConnectV2Connector()

export default WalletConnectV2Connector