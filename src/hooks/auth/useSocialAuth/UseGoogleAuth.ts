import { useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useGoogleAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: 'google',
    name: 'Google',
  })
}
