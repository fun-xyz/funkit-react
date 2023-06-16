/* eslint-disable @typescript-eslint/no-restricted-imports */
import { OAuthProvider } from '@magic-ext/oauth'
import { initializeConnector } from '@web3-react/core'

import { MagicConnect } from '../magic-auth/src'

const MAGIC_API_KEY = 'pk_live_846F1095F0E1303C'
const REDIRECT_URI = 'http://localhost:3000'
const DEFAULT_RPC = 'https://cloudflare-eth.com' //'https://rpc-mainnet.maticvigil.com'
const DEFAULT_CHAIN_ID = 1

export const MagicAuthConnection = (
  oAuthProvider: OAuthProvider,
  redirectUri?: string,
  networkOpts?: { rpcUrl: string; chainId: number }
) =>
  initializeConnector<MagicConnect>((actions) => {
    return new MagicConnect({
      actions,
      options: {
        magicAuthApiKey: MAGIC_API_KEY,
        oAuthProvider,
        redirectURI: redirectUri ?? REDIRECT_URI,
        networkOptions: networkOpts ?? { rpcUrl: DEFAULT_RPC, chainId: DEFAULT_CHAIN_ID },
      },
    })
  })

export default MagicAuthConnection
