import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { GetAssetsError } from '../store'
import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { useFun } from './UseFun'

export const useGetAssets = (build: any) => {
  const { FunWallet, setAssets, assets, setTempError } = useFun(
    (state: useFunStoreInterface) => ({
      FunWallet: state.FunWallet,
      setAssets: state.setAssets,
      assets: state.assets,
      setTempError: state.setTempError,
    }),
    shallow
  )
  const [loading, setLoading] = useState(true)

  const getAssets = useCallback(async () => {
    if (!FunWallet) return
    setLoading(true)
    try {
      const getAssetResult = await FunWallet.getAssets()
      setAssets(getAssetResult)
      setLoading(false)
    } catch (e) {
      setTempError(GetAssetsError)
    }
    setLoading(false)
  }, [assets, FunWallet])

  return { getAssets, loading }
}
