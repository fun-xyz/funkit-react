import {
  ApproveParams,
  EnvOption,
  ExecutionReceipt,
  FinishUnstakeParams,
  RequestUnstakeParams,
  StakeParams,
  SwapParams,
  TransactionData,
  TransferParams,
  UserOp,
} from '@fun-xyz/core'
import { useEffect, useState } from 'react'

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { transactionArgsInterface } from '../utils/Transactions'
import { ShallowEqual, useFun } from './UseFun'

export const useDebugTransaction = (build: transactionArgsInterface) => {
  const { Eoa, FunWallet, error, config } = useFun(
    (state: useFunStoreInterface) => ({
      Eoa: state.Eoa,
      FunWallet: state.FunWallet,
      error: state.txError,
      config: state.config,
    }),
    ShallowEqual
  )
  const [validTx, setValidTx] = useState(false)
  const [txOperation, setTxOperation] = useState<(bigint | UserOp | ExecutionReceipt) | null>(null)

  useEffect(() => {
    if (FunWallet == null || Eoa == null) return
    FunWallet[build.type](
      Eoa,
      build.txParams as (((((TransferParams & ApproveParams) & SwapParams) & StakeParams) &
        (RequestUnstakeParams | FinishUnstakeParams)) &
        (EnvOption | undefined)) &
        TransactionData,
      build.txOptions,
      build.estimateGas
    )
      .then((res) => {
        setValidTx(true)
        setTxOperation(res)
      })
      .catch((err) => {
        console.log('SendTx Error: ', err)
      })
  }, [Eoa, FunWallet, build, config])

  return { valid: validTx, userOp: txOperation, error }
}

export default useDebugTransaction
