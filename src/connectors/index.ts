import { CoinbaseWallet } from "@web3-react/coinbase-wallet"
import { GnosisSafe } from "@web3-react/gnosis-safe"
import { MetaMask } from "@web3-react/metamask"
import { Network } from "@web3-react/network"
import { WalletConnect as WalletConnect } from "@web3-react/walletconnect"
import { WalletConnect as WalletConnectV2 } from "@web3-react/walletconnect-v2"
//
import CoinbaseWalletConnector from "./coinbaseWallet"
import MetamaskConnector from "./metaMask"
import WalletConnectConnector from "./walletConnect"
import WalletConnectV2Connector from "./walletConnectV2"
// import type { Web3ReactHooks } from "@web3-react/core";
import type { Connector } from "@web3-react/types"

export function getName(connector: Connector) {
    if (connector instanceof MetaMask) return "MetaMask"
    if (connector instanceof WalletConnectV2) return "WalletConnect V2"
    if (connector instanceof WalletConnect) return "WalletConnect"
    if (connector instanceof CoinbaseWallet) return "Coinbase Wallet"
    if (connector instanceof Network) return "Network"
    if (connector instanceof GnosisSafe) return "Gnosis Safe"
    return "Unknown"
}

// interface ConnectorAndChains {
//   connector: (
//     RPC_URLs?: string[],
//     appName?: string
//   ) =>
//     | [CoinbaseWallet, Web3ReactHooks]
//     | [CoinbaseWallet, Web3ReactHooks, Web3ReactStore];
// }
// export const BuildConnectorsAndChains = (): ConnectorAndChains => {
//     return {connector: CoinbaseWalletConnector();}
// };

export const connectors = {
    CoinbaseWallet: CoinbaseWalletConnector,
    Metamask: MetamaskConnector,
    WalletConnect: WalletConnectConnector,
    WalletConnectV2: WalletConnectV2Connector
}
