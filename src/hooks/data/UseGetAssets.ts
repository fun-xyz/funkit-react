import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { FunError, GetAssetsError } from '../../store'
import { useFunStoreInterface } from '../../store/CreateUseFunStore'
import { FunkitAssets } from '../../store/plugins/AssetsStore'
import { useFun } from '../UseFun'

export interface useGetAssetsReturn {
  assets: FunkitAssets | null
  getAssets: () => Promise<FunkitAssets | null>
  loading: boolean
  error: FunError | null
}

export const useGetAssets = (
  chainId?: string | 'ALL' | undefined,
  onlyVerifiedTokens = false,
  checkStatus = false
): useGetAssetsReturn => {
  const { userWallet, setAssets, assets, error, setTempError } = useFun(
    (state: useFunStoreInterface) => ({
      userWallet: state.FunWallet,
      setAssets: state.setAssets,
      assets: state.assets,
      error: state.error,
      setTempError: state.setTempError,
    }),
    shallow
  )
  const [loading, setLoading] = useState(false)

  const getAssets = useCallback(async () => {
    setLoading(true)
    try {
      const wallet = userWallet
      if (!wallet) {
        throw new Error('Wallet Not Initialized')
      }
      const getAssetResult = (await wallet.getAssets(chainId, onlyVerifiedTokens, checkStatus)) as FunkitAssets
      setAssets(getAssetResult)
      setLoading(false)
      return getAssetResult
    } catch (e) {
      setTempError(GetAssetsError)
      return null
    }
    setLoading(false)
  }, [chainId, checkStatus, onlyVerifiedTokens, setAssets, setTempError, userWallet])

  return { assets: assets as FunkitAssets, getAssets, loading, error }
}
