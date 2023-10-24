import { SocialAuthProviders, useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useAppleAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: SocialAuthProviders.Apple,
    name: 'Apple',
  })
}
