import { ExecutionReceipt } from '@fun-xyz/core'

const MAX_TRANSACTION_HISTORY = 10

export interface TransactionStoreState {
  transactions: ExecutionReceipt[]
  lastTransaction: ExecutionReceipt | null
  addTransaction: (newTransaction: ExecutionReceipt) => void
}

export const addNewTransaction = (
  newTransaction: ExecutionReceipt,
  get: () => TransactionStoreState,
  set: (TransactionStoreState) => void
) => {
  const transactions = get().transactions
  transactions.unshift(newTransaction)
  if (transactions.length > MAX_TRANSACTION_HISTORY) transactions.pop()
  set({
    transactions,
    lastTransaction: newTransaction,
  })
}

