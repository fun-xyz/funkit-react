import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'

const CoinbaseWalletConnector = (RPC_URLs = ['https://goerli.gateway.tenderly.co'], appName = 'fun-wallet-react') => {
  return initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          url: RPC_URLs[0],
          appName,
        },
      })
  )
}
export const [coinbaseWallet, hooks] = CoinbaseWalletConnector()

export default CoinbaseWalletConnector
