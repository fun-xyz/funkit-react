import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

export const InitWalletConnectConnector = (appId = '84012e566d88d63119afe996d7b327bc', chains = [1]) => {
  return initializeConnector<WalletConnectV2>(
    (actions) =>
      new WalletConnectV2({
        actions,
        options: {
          projectId: appId,
          chains,
          showQrModal: true,
        },
      })
  )
}

export default InitWalletConnectConnector
