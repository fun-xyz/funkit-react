import { useCallback } from 'react'

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { useFun } from './UseFun'

export const useGetAssets = (build: any) => {
  const { FunWallet, index, error, setTempError } = useFun((state: useFunStoreInterface) => ({
    FunWallet: state.FunWallet,
    index: state.index,
    error: state.error,
    setIndex: state.setIndex,
    setTempError: state.setTempError,
  }))

  const getAssets = useCallback(async () => {
    if (FunWallet) {
      const assets = await FunWallet.getAssets()
      return assets
    }
  }, [FunWallet])

  return { index, error, setTempError, getAssets }
}
