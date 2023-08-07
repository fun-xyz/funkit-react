import { FunWallet } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { GetOnRampError } from '../../store'
import { useFunStoreInterface } from '../../store/CreateUseFunStore'
import { useFun } from '../UseFun'

export const useOnRamp = () => {
  const { userWallet, setOnRamp, onRamp, error, setTempError } = useFun(
    (state: useFunStoreInterface) => ({
      userWallet: state.FunWallet,
      setOnRamp: state.setOnRamp,
      onRamp: state.onRamp,
      error: state.error,
      setTempError: state.setTempError,
    }),
    shallow
  )
  const [loading, setLoading] = useState(false)

  const getOnRamp = useCallback(async () => {
    setLoading(true)
    try {
      let wallet = userWallet
      if (!wallet) wallet = new FunWallet({ uniqueId: '0x00' })
      const getOnRampResult = await wallet.onRamp()
      setOnRamp(getOnRampResult)
      setLoading(false)
    } catch (e) {
      setTempError(GetOnRampError)
    }
    setLoading(false)
  }, [setOnRamp, setTempError, userWallet])

  return { onRamp, getOnRamp, loading, error }
}
