import { useSocialAuthConnectorBase } from './UseSocialAuthBase'

export const useDiscordAuth = () => {
  return useSocialAuthConnectorBase({
    oAuthProvider: 'discord',
    name: 'Discord',
  })
}
