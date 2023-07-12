import { FunError, generateTransactionError, TransactionErrorEstimateGasFailed } from '@/store'

import { transactionArgsInterface } from '../utils/Transactions'
import { useTransaction } from './UseTransaction'

interface IEstimateGas {
  gas: bigint
  error: FunError | null
  valid: boolean
}

export const useEstimateGas = (build: transactionArgsInterface): IEstimateGas => {
  const { gas, valid, error } = useTransaction({ ...build, estimateGas: true })
  if (gas == null)
    return { gas: 0n, valid: false, error: generateTransactionError(TransactionErrorEstimateGasFailed, build) }
  return {
    gas,
    valid,
    error,
  }
}
