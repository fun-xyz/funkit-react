import { Auth } from '@funkit/core'

export interface socialLoginReturn {
  auth: Auth
  active: boolean
  activating: boolean
  authAddr: string | undefined
  name: string | undefined
  login: () => Promise<void>
  logout: () => Promise<void>
}
