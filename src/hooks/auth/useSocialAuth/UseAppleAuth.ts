import { useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useAppleAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: 'apple',
    name: 'Apple',
  })
}
