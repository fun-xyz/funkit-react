import { initializeConnector } from '@web3-react/core'

import { MagicAuthConnector } from '../magic-auth/MagicAuthConnector'

export const GoogleAuthConnector = () =>
  initializeConnector<MagicAuthConnector>((actions) => {
    return new MagicAuthConnector({
      actions,
      options: {
        magicAuthApiKey: 'pk_live_846F1095F0E1303C',
        oAuthProvider: 'google',
        networkOptions: {
          rpcUrl: 'https://rpc-mainnet.maticvigil.com',
          chainId: 137,
        },
      },
    })
  })

export const [metaMask, hooks] = GoogleAuthConnector()

export default GoogleAuthConnector
