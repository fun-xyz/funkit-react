import { FunWallet } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { GetAssetsError } from '../../store'
import { useFunStoreInterface } from '../../store/CreateUseFunStore'
import { useFun } from '../UseFun'

export interface assetRequest {
  address: string
}

export const useGetAssets = (req: assetRequest) => {
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
      let wallet = userWallet
      if (!wallet) wallet = new FunWallet({ uniqueId: '0x00' })
      const getAssetResult = await wallet.getAssets()
      setAssets(getAssetResult)
      setLoading(false)
    } catch (e) {
      setTempError(GetAssetsError)
    }
    setLoading(false)
  }, [setAssets, setTempError, userWallet])

  return { assets, getAssets, loading, error }
}
