import { initializeConnector } from "@web3-react/core"
import { Network } from "@web3-react/network"

const URLS = ["https://cloudflare-eth.com", "https://polygon-rpc.com", "https://arb1.arbitrum.io/rpc"]

const NetworkConnector = (RPC_URLs = URLS) => {
    return initializeConnector<Network>((actions) => new Network({ actions, urlMap: RPC_URLs }))
}
export const [network, hooks] = NetworkConnector()

export default NetworkConnector
