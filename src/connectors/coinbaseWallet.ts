import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'

const CoinbaseWalletConnector = (rpcUrl = ['https://goerli.gateway.tenderly.co'], appName = 'fun-wallet-react') => {
  return initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          url: rpcUrl[0],
          appName,
        },
      })
  )
}
export const [coinbaseWallet, hooks] = CoinbaseWalletConnector()

export default CoinbaseWalletConnector
