import { UseSocialAuthBase } from './UseSocialAuthBase'

export const useDiscordAuth = () => {
  return UseSocialAuthBase({
    provider: 'discord',
    name: 'Discord',
    networkOptions: { chainId: 1, rpcUrl: 'https://cloudflare-eth.com' },
  })
}
