import { Chain } from '@fun-xyz/core'
import { convertToChain, Binance, Polygon, FunTestnet } from './Networks'

describe('convertToChain', () => {
  it('should convert chain string or number to corresponding Chain object', async () => {
    // expect(convertToChain(1)).toBe(Ethereum)
    // expect(convertToChain('1')).toBe(Ethereum)
    // expect(convertToChain('ethereum')).toBe(Ethereum)
    expect(await convertToChain('binance')).toBe(Binance)
    expect(await convertToChain(137)).toBe(Polygon)
    expect(await convertToChain('funTestnet')).toBe(FunTestnet)
  })

  it('should return undefined for unknown chain', async  () => {
    expect(await convertToChain('unknown')).toBeUndefined()
    expect(await convertToChain(123)).toBeUndefined()
  })
})