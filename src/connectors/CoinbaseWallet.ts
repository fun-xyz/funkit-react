import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'

export const InitCoinbaseWalletConnector = (
  appName = 'fun-wallet-react',
  rpcUrl = ['https://goerli.gateway.tenderly.co']
) => {
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
export const [coinbaseWallet, hooks] = InitCoinbaseWalletConnector()

export default InitCoinbaseWalletConnector
