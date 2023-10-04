import { UseSocialAuthBase } from './UseSocialAuthBase'

export const useAppleAuth = () => {
  return UseSocialAuthBase({
    provider: 'apple',
    name: 'Apple',
    networkOptions: { chainId: 1, rpcUrl: 'https://cloudflare-eth.com' },
  })
}
