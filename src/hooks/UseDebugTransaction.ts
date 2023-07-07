import { useState } from 'react'

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { ShallowEqual, useFun } from './UseFun'

export const useDebuTransaction = () => {
  const { account, Eoa, FunWallet, error, config, setTempError, resetTxError } = useFun(
    (state: useFunStoreInterface) => ({
      account: state.account,
      Eoa: state.Eoa,
      FunWallet: state.FunWallet,
      index: state.index,
      error: state.txError,
      config: state.config,
      setIndex: state.setIndex,
      setTxError: state.setTxError,
      setTempError: state.setTempError,
      resetTxError: state.resetTxError,
    }),
    ShallowEqual
  )
  const [validTx, setValidTx] = useState(true)

  return { valid: validTx, error }
}

export default useDebuTransaction
