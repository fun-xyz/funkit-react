import { FunWallet } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { GetOffRampError } from '../../store'
import { useFunStoreInterface } from '../../store/CreateUseFunStore'
import { useFun } from '../UseFun'

export const useOffRamp = () => {
  const { userWallet, setOffRamp, offRamp, error, setTempError } = useFun(
    (state: useFunStoreInterface) => ({
      userWallet: state.FunWallet,
      setOffRamp: state.setOffRamp,
      offRamp: state.offRamp,
      error: state.error,
      setTempError: state.setTempError,
    }),
    shallow
  )
  const [loading, setLoading] = useState(false)

  const getOffRamp = useCallback(async () => {
    setLoading(true)
    try {
      let wallet = userWallet
      if (!wallet) wallet = new FunWallet({ uniqueId: '0x00' })
      const getOffRampResult = await wallet.offRamp()
      setOffRamp(getOffRampResult)
      setLoading(false)
    } catch (e) {
      setTempError(GetOffRampError)
    }
    setLoading(false)
  }, [setOffRamp, setTempError, userWallet])

  return { offRamp, getOffRamp, loading, error }
}
