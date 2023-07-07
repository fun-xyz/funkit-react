/* eslint-disable @typescript-eslint/no-restricted-imports */
import { OAuthProvider } from '@magic-ext/oauth'
import { initializeConnector } from '@web3-react/core'

import { MagicAuthConnector } from '../magicAuth/src/MagicAuth'

const MAGIC_API_KEY = 'pk_live_846F1095F0E1303C'
const REDIRECT_URI = 'http://localhost:3000'
const DEFAULT_RPC = 'https://cloudflare-eth.com' //'https://rpc-mainnet.maticvigil.com'
const DEFAULT_CHAIN_ID = 1
const SUPPORTED_OAUTH_PROVIDERS: OAuthProvider[] = ['google', 'twitter', 'apple', 'discord']

export const SocialOauthConnector = (
  supportedAuthProviders: OAuthProvider[],
  redirectUri?: string,
  networkOpts?: { rpcUrl: string; chainId: number }
) =>
  initializeConnector<MagicAuthConnector>((actions) => {
    return new MagicAuthConnector({
      actions,
      options: {
        magicAuthApiKey: MAGIC_API_KEY,
        supportedAuthProviders: SUPPORTED_OAUTH_PROVIDERS || supportedAuthProviders,
        redirectURI: redirectUri ?? REDIRECT_URI,
        networkOptions: networkOpts ?? {
          rpcUrl: DEFAULT_RPC,
          chainId: DEFAULT_CHAIN_ID,
        },
      },
    })
  })

export default SocialOauthConnector
