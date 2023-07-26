import { Auth } from '@fun-xyz/core'

import { usePrimaryConnector } from './UsePrimaryConnector'

export const usePrimaryAuth = () => {
  const primary = usePrimaryConnector()

  if (primary.provider == null) return null
  const auth = new Auth({ provider: primary.provider })
  return auth
}
