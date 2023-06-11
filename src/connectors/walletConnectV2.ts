import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

const WalletConnectV2Connector = (chains = [1, 5, 137, 42161], appName = '3f159ff0ea451618ca6f5f8312dd30f0') => {
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
