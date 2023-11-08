import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

/**
 * @deprecated This provider is deprecated. Please use `usePrivyAuth` instead.
 */
export const useAppleAuth_DEPRECATED = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Apple,
    name: 'Apple',
  })
}
