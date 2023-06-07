import { initializeConnector } from "@web3-react/core"
import { WalletConnect } from "@web3-react/walletconnect"

const URLS = ["https://cloudflare-eth.com", "https://polygon-rpc.com", "https://arb1.arbitrum.io/rpc"]

const WalletConnectConnector = (RPC_URLs = URLS) => {
    return initializeConnector<WalletConnect>(
        (actions) =>
            new WalletConnect({
                actions,
                options: {
                    rpc: RPC_URLs
                }
            })
    )
}

export const [walletConnect, hooks] = WalletConnectConnector()

export default WalletConnectConnector
