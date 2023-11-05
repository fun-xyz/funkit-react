import { Auth } from '@funkit/core'

/**
 * Generates a unique identifier for a wallet using the provided `auth` object and an optional `index`.
 * @param auth - The authentication object used to generate the unique identifier.
 * @param index - An optional index used to generate the unique identifier. Defaults to a random number between 0 and 1 billion. Collisions can occur if the same index is used for multiple wallets.
 * @returns A unique identifier for a wallet.
 */
export const generateWalletUniqueId = (auth: Auth, index = Math.floor(Math.random() * 1000000000)) => {
  return auth.getWalletUniqueId(index)
}
