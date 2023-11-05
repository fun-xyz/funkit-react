import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useDiscordAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Discord,
    name: 'Discord',
  })
}
