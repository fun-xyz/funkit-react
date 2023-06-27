import { useCallback } from 'react'

import { useFunStoreInterface } from '../store/funStore'
import { useFun } from './useFun'

export const useCreateNewFunWallet = (build) => {
  const { FunWallet, index, error, setIndex, setTempError } = useFun((state: useFunStoreInterface) => ({
    FunWallet: state.FunWallet,
    index: state.index,
    error: state.error,
    setIndex: state.setIndex,
    setTempError: state.setTempError,
  }))

  const createNewFunWallet = useCallback(
    (index: number) => {
      if (FunWallet) {
        setTempError({
          code: 1001,
          message: 'FunWallet already exists. Please disconnect before creating a new one.',
        })
        return
      }
      build(index)
    },
    [FunWallet, build, setTempError]
  )

  return { index, error, setTempError, createNewFunWallet }
}
