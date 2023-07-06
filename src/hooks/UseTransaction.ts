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

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { FunError, TransactionErrorCatch, TransactionErrorMissingOrIncorrectFields } from '../store/plugins/ErrorStore'
import { validateGasBehavior } from '../utils/Transactions'
import { useFun } from './UseFun'
import { usePrevious } from './UsePrevious'
export type transactionTypes = 'transfer' | 'approve' | 'swap' | 'stake' | 'unstake' | 'create' | 'execRawTx'
export type transactionParams =
  | TransferParams
  | ApproveParams
  | SwapParams
  | StakeParams
  | RequestUnstakeParams
  | FinishUnstakeParams
  | TransactionData

export interface transactionArgsInterface {
  type: transactionTypes
  txParams: transactionParams
  txOptions?: (EnvOption & false) | (EnvOption & true)
  estimateGas?: boolean
}
const shallowCompare = (obj1: Record<string, any> | null | undefined, obj2: Record<string, any>): boolean => {
  if (obj1 == null) return false
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every((key) => Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key])
  )
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

/**
 * This hook is used to validate and send transactions to the blockchain.
 * It takes a `build` object as input
 * @param build contains the transaction type, parameters, options, and gas estimation.
 * It returns an object with the following properties:
 * @returns `valid`: a boolean indicating whether the transaction is valid or not.
 * @returns `loading`: a boolean indicating whether the transaction is currently being processed or not.
 * @returns `data`: the transaction hash or receipt if the transaction was successful, otherwise null.
 * @returns `error`: an error object if the transaction failed, otherwise null.
 * @returns `sendTransaction`: a function that sends the transaction to the blockchain.
 */
export const useTransaction = (build: transactionArgsInterface) => {
  const prevType = usePrevious(build.type)
  const prevTxParams = usePrevious(build.txParams)
  const prevTxOptions = usePrevious(build.txOptions)
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
    })
  )
  const prevGlobalConfig = usePrevious(config)
  const prevAccount = usePrevious(account)

  const [loading, setLoading] = useState(true)
  const [validTx, setValidTx] = useState(true)
  const [txHash, setTxHash] = useState<bigint | UserOp | ExecutionReceipt | null>(null)
  const [validateWallet, setValidateWallet] = useState(true)
  const [txError, setTxError] = useState<FunError | null>(null)

  useEffect(() => {
    // console.log('Validating transaction opts: ', build)
    if (FunWallet == null) return
    if (txError == TransactionErrorMissingOrIncorrectFields) return
    if (prevType !== build.type || !shallowCompare(prevTxParams, build.txParams)) {
      if (!checkTransactionType(build) && validTx) {
        setTxError(TransactionErrorMissingOrIncorrectFields)
        setValidTx(false)
        return
      } else if (txError == TransactionErrorMissingOrIncorrectFields) {
        setTxError(null)
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
    // console.log(
    //   'checking gas behavior',
    //   validateWallet,
    //   txError,
    //   prevAccount !== account,
    //   prevGlobalConfig !== config,
    //   prevTxOptions !== build.txOptions
    // )
    if (
      validateWallet ||
      txError ||
      prevAccount !== account ||
      prevGlobalConfig !== config ||
      prevTxOptions !== build.txOptions
    ) {
      if (validateWallet || prevAccount !== account || prevGlobalConfig !== config || prevTxOptions !== build.txOptions)
        checkGasBehavior()
      interval = setInterval(checkGasBehavior, 15000) // Check every 30 seconds
    } else {
      if (loading) setLoading(false)
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
    txError,
    resetTxError,
    prevAccount,
    account,
    loading,
    error,
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
  return { valid: validTx, loading, data: txHash, error: txError, sendTransaction }
}
