import { useCallback } from 'react'

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { useFun } from './UseFun'

export const useGetAssets = (build: any) => {
  const { FunWallet, setAssets, assets } = useFun((state: useFunStoreInterface) => ({
    FunWallet: state.FunWallet,
    setAssets: state.setAssets,
    assets: state.assets,
  }))

  const getAssets = useCallback(async () => {
    if (FunWallet) {
      try {
        const getAssetResult = await FunWallet.getAssets()
        setAssets(getAssetResult)
      } catch (e) {
        console.log(e, 'Failed to get Assets')
      }
    }
  }, [assets, FunWallet])

  return { getAssets }
}
