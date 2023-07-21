import {
  ApproveParams,
  EnvOption,
  ExecutionReceipt,
  FinishUnstakeParams,
  FunWallet,
  RequestUnstakeParams,
  StakeParams,
  SwapParams,
  TransactionData,
  TransferParams,
} from '@fun-xyz/core'
import { useCallback, useEffect, useState } from 'react'

import { useFunStoreInterface } from '../store/CreateUseFunStore'
import { FunError, TransactionErrorCatch, TransactionErrorMissingOrIncorrectFields } from '../store/plugins/ErrorStore'
import { checkTransactionType, transactionArgsInterface, validateGasBehavior } from '../utils/Transactions'
import { useFun } from './UseFun'
import { usePrevious } from './UsePrevious'

const shallowCompare = (obj1: Record<string, any> | null | undefined, obj2: Record<string, any>): boolean => {
  if (obj1 == null) return false
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every((key) => Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key])
  )
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
  const { account, Eoa, FunWallet, config, transactions, lastTransaction, addTransaction, setTempError } = useFun(
    (state: useFunStoreInterface) => ({
      account: state.account,
      Eoa: state.Eoa,
      FunWallet: state.FunWallet,
      index: state.index,
      config: state.config,
      transactions: state.transactions,
      lastTransaction: state.lastTransaction,
      setIndex: state.setIndex,
      addTransaction: state.addTransaction,
      setTxError: state.setTxError,
      setTempError: state.setTempError,
    })
  )
  const prevGlobalConfig = usePrevious(config)
  const prevAccount = usePrevious(account)
  const prevFunWallet = usePrevious(FunWallet)

  const [TransactionSentStatus, setTransactionSentStatus] = useState(true)
  const [validTx, setValidTx] = useState(true)
  const [txError, setTxError] = useState<FunError | null>(null)

  const checkGasBehavior = useCallback(
    async (funWallet: FunWallet, interval: number | null) => {
      const currentConfig = build.txOptions || (config as EnvOption)
      if (currentConfig == null) return
      try {
        const res = await validateGasBehavior(currentConfig, funWallet)
        if (!res.valid && res.error) {
          setTxError(res.error)
          if (validTx) setValidTx(false)
        } else {
          if (validTx !== res.valid) setValidTx(res.valid)
          if (interval) clearInterval(interval)
          setTxError(null)
        }
      } catch (err) {
        console.log('Gas Validation ERR', err)
        setTxError(TransactionErrorCatch)
        if (validTx) setValidTx(false)
      }
    },
    [build.txOptions, config, validTx]
  )

  useEffect(() => {
    if (FunWallet == null || prevFunWallet != null) return
    console.log('Checking gas behavior once ideally')

    checkGasBehavior(FunWallet, null)
  }, [FunWallet, checkGasBehavior, prevFunWallet])

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
    let interval: NodeJS.Timeout | null = null

    if (txError || prevAccount !== account || prevGlobalConfig !== config || prevTxOptions !== build.txOptions) {
      if (prevAccount !== account || prevGlobalConfig !== config || prevTxOptions !== build.txOptions)
        checkGasBehavior(FunWallet, interval)
      interval = setInterval(() => checkGasBehavior(FunWallet, interval as unknown as number), 30000) // Check every 30 seconds
    } else {
      if (TransactionSentStatus) setTransactionSentStatus(false)
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
    TransactionSentStatus,
    txError,
    prevAccount,
    account,
    prevGlobalConfig,
    config,
    prevTxOptions,
    checkGasBehavior,
  ])

  const sendTransaction = useCallback(() => {
    if (FunWallet == null || Eoa == null) return
    if (TransactionSentStatus) return
    if (!validTx) return
    setTransactionSentStatus(true)
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
        addTransaction(res as ExecutionReceipt)
        setTransactionSentStatus(false)
      })
      .catch((err) => {
        console.log('SendTx Error: ', err)
        setTransactionSentStatus(false)
        setTempError({
          code: 1001,
          message: err.message,
        })
      })
  }, [
    Eoa,
    FunWallet,
    addTransaction,
    build.estimateGas,
    build.txOptions,
    build.txParams,
    build.type,
    TransactionSentStatus,
    setTempError,
    validTx,
  ])

  // console.log({ valid: validTx, loading, data: txHash, error })
  return {
    valid: validTx,
    loading: TransactionSentStatus,
    txResult: lastTransaction,
    txHistory: transactions,
    error: txError,
    sendTransaction,
  }
}
