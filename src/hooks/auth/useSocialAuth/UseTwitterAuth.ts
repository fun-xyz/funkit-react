import { UseSocialAuthBase } from './UseSocialAuthBase'

export const useTwitterAuth = () => {
  return UseSocialAuthBase({
    provider: 'twitter',
    name: 'Twitter',
    networkOptions: { chainId: 1, rpcUrl: 'https://cloudflare-eth.com' },
  })
}
