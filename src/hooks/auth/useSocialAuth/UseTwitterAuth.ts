import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

/**
 * @deprecated This provider is deprecated. Please use `usePrivyAuth` instead.
 */
export const useTwitterAuth_DEPRECATED = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Twitter,
    name: 'Twitter',
  })
}
