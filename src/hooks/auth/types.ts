import { Auth } from '@funkit/core'

export interface authHookReturn {
  auth: Auth | undefined
  active: boolean
  activating: boolean
  authAddr: string | undefined
  name: string | undefined
  login: () => Promise<void>
  logout: () => Promise<void>
}

export interface TurnkeyAuthHookReturn extends Omit<authHookReturn, 'login'> {
  login: (hasExistingPasskey: boolean) => Promise<void>
}
