import { pad } from 'viem'

export const convertToValidUserId = (userId: string | `0x${string}`) => {
  if (!userId.startsWith('0x')) throw new Error(`Invalid userId: ${userId}`)
  return pad(userId as `0x${string}`, { size: 32 }).toLowerCase() as `0x${string}`
}

export function getMatchingHexStrings(hexStrings: (string | undefined)[], indexList?: number[]) {
  if (indexList === undefined) return hexStrings
  const result: string[] = []

  for (const index of indexList) {
    const hexString = hexStrings[index]

    if (hexString !== undefined) {
      result.push(hexString)
    }
  }

  return result
}
