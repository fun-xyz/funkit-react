import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useGoogleAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Google,
    name: 'Google',
  })
}
