import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useTwitterAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Twitter,
    name: 'Twitter',
  })
}
