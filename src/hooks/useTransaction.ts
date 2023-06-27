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
import { useCallback, useEffect, useState } from 'react'

import { useFunStoreInterface } from '../store/funStore'
import { TransactionErrorCatch, TransactionErrorMissingOrIncorrectFields } from '../store/plugins/errorStore'
import { validateGasBehavior } from '../utils/transactions'
import { useFun } from './useFun'
import { usePrevious } from './usePrevious'
export type transactionTypes = 'transfer' | 'approve' | 'swap' | 'stake' | 'unstake' | 'create' | 'execRawTx'

export interface transactionArgsInterface {
  type: transactionTypes
  txParams:
    | TransferParams
    | ApproveParams
    | SwapParams
    | StakeParams
    | RequestUnstakeParams
    | FinishUnstakeParams
    | TransactionData
  txOptions?: (EnvOption & false) | (EnvOption & true)
  estimateGas?: boolean
}

function checkTransactionType(txArgs: transactionArgsInterface): boolean {
  switch (txArgs.type) {
    case 'transfer':
      if (
        (txArgs.txParams['to'] && txArgs.txParams['amount']) || // NATIVE TRANSFER
        (txArgs.txParams['to'] && txArgs.txParams['amount'] && txArgs.txParams['token']) || // ERC20 Transfer
        (txArgs.txParams['to'] && txArgs.txParams['tokenId'] && txArgs.txParams['token']) // ERC721 Transfer
      )
        return true
      return false
    case 'approve':
      if (
        (txArgs.txParams['spender'] && txArgs.txParams['token'] && txArgs.txParams['amount']) || // ERC20 Approve
        (txArgs.txParams['spender'] && txArgs.txParams['token'] && txArgs.txParams['tokenId']) // ERC721 Approve
      )
        return true
      return false
    case 'swap':
      if (txArgs.txParams['in'] && txArgs.txParams['out'] && txArgs.txParams['amount']) return true
      return false
    case 'stake':
      if (
        txArgs.txParams['amount'] &&
        !txArgs.txParams['in'] &&
        !txArgs.txParams['token'] &&
        !txArgs.txParams['spender']
      )
        return true
      return false
    case 'unstake':
      if (
        txArgs.txParams['recipient'] &&
        !txArgs.txParams['in'] &&
        !txArgs.txParams['token'] &&
        !txArgs.txParams['spender']
      )
        return true
      return false
    case 'execRawTx':
      if (txArgs.txParams['to'] && !txArgs.txParams['in'] && !txArgs.txParams['token'] && !txArgs.txParams['spender'])
        return true
      return false
    default:
      return false
  }
}

export const useTransaction = (build: transactionArgsInterface) => {
  const prevType = usePrevious(build.type)
  const prevTxParams = usePrevious(build.txParams)
  const prevTxOptions = usePrevious(build.txOptions)
  const { Eoa, FunWallet, error, config, setTxError, setTempError, resetTxError } = useFun(
    (state: useFunStoreInterface) => ({
      Eoa: state.Eoa,
      FunWallet: state.FunWallet,
      index: state.index,
      error: state.txError,
      config: state.config,
      setIndex: state.setIndex,
      setTxError: state.setTxError,
      setTempError: state.setTempError,
      resetTxError: state.resetTxError,
    })
  )
  const prevGlobalConfig = usePrevious(config)

  const [loading, setLoading] = useState(false)
  const [validTx, setValidTx] = useState(true)
  const [txHash, setTxHash] = useState<bigint | UserOp | ExecutionReceipt | null>(null)
  const [validateWallet, setValidateWallet] = useState(true)

  // Validate the transaction any time it changes
  useEffect(() => {
    // console.log('Validating transaction opts: ', build)
    if (FunWallet == null) return
    if (prevType !== build.type || prevTxParams !== build.txParams) {
      if (!checkTransactionType(build) && validTx) {
        setTxError(TransactionErrorMissingOrIncorrectFields)
        setValidTx(false)
        return
      } else {
        if (error) resetTxError()
      }
    }
    let interval: ReturnType<typeof setInterval> | null = null

    const checkGasBehavior = async () => {
      const currentConfig = build.txOptions || (config as EnvOption)
      try {
        const res = await validateGasBehavior(currentConfig, FunWallet)
        if (!res.valid && res.error) {
          setTxError(res.error)
          if (validTx) setValidTx(false)
          if (validateWallet) setValidateWallet(false)
        } else {
          if (res.valid !== validTx) setValidTx(res.valid)
          if (interval) clearInterval(interval)
          if (validateWallet) setValidateWallet(false)
          if (error) resetTxError()
        }
      } catch (err) {
        console.log(err)
        setTxError(TransactionErrorCatch)
        if (validTx) setValidTx(false)
        if (validateWallet) setValidateWallet(false)
      }
    }

    // Set up interval if there's an error or config changed
    if (validateWallet || error || prevGlobalConfig !== config || prevTxOptions !== build.txOptions) {
      if (validateWallet) checkGasBehavior()
      interval = setInterval(checkGasBehavior, 15000) // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval) // Clear interval on cleanup
    }
  }, [
    validTx,
    build,
    prevType,
    prevTxParams,
    FunWallet,
    prevTxOptions,
    prevGlobalConfig,
    config,
    setTxError,
    validateWallet,
    error,
    resetTxError,
  ])

  const sendTransaction = useCallback(() => {
    if (FunWallet == null || Eoa == null) return
    if (loading) return
    if (!validTx) return
    setLoading(true)
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
        setTxHash(res)
        setLoading(false)
      })
      .catch((err) => {
        console.log('SendTx Error: ', err)
        setLoading(false)
        setTempError({
          code: 1001,
          message: err.message,
        })
      })
  }, [Eoa, FunWallet, build.estimateGas, build.txOptions, build.txParams, build.type, loading, setTempError, validTx])
  // console.log({ valid: validTx, loading, data: txHash, error })
  return { valid: validTx, loading, data: txHash, error, sendTransaction }
}
