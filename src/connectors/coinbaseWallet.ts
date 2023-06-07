import { CoinbaseWallet } from "@web3-react/coinbase-wallet"
import { initializeConnector } from "@web3-react/core"

const CoinbaseWalletConnector = (
    RPC_URLs = ["https://mainnet.infura.io/v3/", "https://goerli.infura.io/v3/"],
    appName = "fun-wallet-react"
) => {
    return initializeConnector<CoinbaseWallet>(
        (actions) =>
            new CoinbaseWallet({
                actions,
                options: {
                    url: RPC_URLs,
                    appName: appName
                }
            })
    )
}
export const [coinbaseWallet, hooks] = CoinbaseWalletConnector()

export default CoinbaseWalletConnector
