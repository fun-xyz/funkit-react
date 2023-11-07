import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

/**
 * @deprecated This provider is deprecated. Please use `usePrivyAuth` instead.
 */
export const useGoogleAuth_DEPRECATED = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Google,
    name: 'Google',
  })
}
