import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { GetAssetsError } from '../../store'
import { useFunStoreInterface } from '../../store/CreateUseFunStore'
import { useFun } from '../UseFun'

export const useGetAssets = (chainId?: string | 'ALL' | undefined, onlyVerifiedTokens = false, checkStatus = false) => {
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
      const getAssetResult = await wallet.getAssets(chainId, onlyVerifiedTokens, checkStatus)
      setAssets(getAssetResult)
      setLoading(false)
    } catch (e) {
      setTempError(GetAssetsError)
    }
    setLoading(false)
  }, [chainId, checkStatus, onlyVerifiedTokens, setAssets, setTempError, userWallet])

  return { assets, getAssets, loading, error }
}
