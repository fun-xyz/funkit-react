import { useCallback } from 'react'

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { useFun } from './UseFun'

export const useGetAssets = (build: any) => {
  const { FunWallet, index, error, setTempError, setAssets, assets } = useFun((state: useFunStoreInterface) => ({
    FunWallet: state.FunWallet,
    index: state.index,
    error: state.error,
    setIndex: state.setIndex,
    setTempError: state.setTempError,
    setAssets: state.setAssets,
    assets: state.assets,
  }))

  const getAssets = useCallback(async () => {
    if (FunWallet) {
      const getAssetResult = await FunWallet.getAssets()
      setAssets(getAssetResult)
    }
  }, [assets, FunWallet])

  return { index, error, setTempError, getAssets }
}
