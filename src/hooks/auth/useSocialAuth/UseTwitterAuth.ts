import { useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useTwitterAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: 'twitter',
    name: 'Twitter',
  })
}
