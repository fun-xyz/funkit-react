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
