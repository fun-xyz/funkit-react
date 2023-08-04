import { Chain } from '@fun-xyz/core'
import { convertToChain, Binance, Polygon, FunTestnet } from './Networks'

describe('convertToChain', () => {
  it('should convert chain string or number to corresponding Chain object', () => {
    // expect(convertToChain(1)).toBe(Ethereum)
    // expect(convertToChain('1')).toBe(Ethereum)
    // expect(convertToChain('ethereum')).toBe(Ethereum)
    expect(convertToChain('binance')).toBe(Binance)
    expect(convertToChain(137)).toBe(Polygon)
    expect(convertToChain('funTestnet')).toBe(FunTestnet)
  })

  it('should return undefined for unknown chain', () => {
    expect(convertToChain('unknown')).toBeUndefined()
    expect(convertToChain(123)).toBeUndefined()
  })
})