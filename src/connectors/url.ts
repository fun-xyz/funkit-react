import { initializeConnector } from "@web3-react/core"
import { Url } from "@web3-react/url"

const URLS = ["https://cloudflare-eth.com", "https://polygon-rpc.com", "https://arb1.arbitrum.io/rpc"]

const UrlConnector = (RPC_URLs = URLS) => {
    return initializeConnector<Url>((actions) => new Url({ actions, url: RPC_URLs[1][0] }))
}

export const [url, hooks] = UrlConnector()

export default UrlConnector
