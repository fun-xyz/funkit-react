import { UseSocialAuthBase } from './UseSocialAuthBase'

export const useGoogleAuth = () => {
  return UseSocialAuthBase({
    provider: 'google',
    name: 'Google',
    networkOptions: { chainId: 1, rpcUrl: 'https://cloudflare-eth.com' },
  })
}
