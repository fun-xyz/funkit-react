import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

/**
 * @deprecated This provider is deprecated. Please use `usePrivyAuth` instead.
 */
export const useDiscordAuth_DEPRECATED = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Discord,
    name: 'Discord',
  })
}
