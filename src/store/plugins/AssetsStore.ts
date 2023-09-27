export interface AssetData {
  address: string
  balance: string
  chainId: number
  decimals: number
  logoURI: string | null
  price: number
  symbol: string
  bridge?: string | null
  protocol?: string | null
  status?: string | null
  dollarAmount?: number
}

export interface NFTData {
  address: string
  uri: string
  chainId: number
  logoURI: string | null
  name: string
  symbol: string
}

export interface FunkitAssets {
  native: {
    [key: string]: AssetData
  }
  nfts: { [key: string | number]: NFTData[] }
  tokens: {
    [key: string]: {
      [key: string]: AssetData
    }
  }
}

export interface AssetStoreInterface {
  asset: FunkitAssets | null
}
