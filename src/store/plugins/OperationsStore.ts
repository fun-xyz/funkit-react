import { ExecutionReceipt, Operation } from '@funkit/core'

const MAX_TRANSACTION_HISTORY = 10

export interface TransactionStoreState {
  transactions: ExecutionReceipt[]
  lastTransaction: ExecutionReceipt | null
  addTransaction: (newTransaction: ExecutionReceipt) => void
  operations: Operation[]
  addOperation: (newOperation: Operation) => void
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

export const configureTransactionStore = (get: () => TransactionStoreState, set: (TransactionStoreState) => void) => ({
  transactions: [],
  lastTransaction: null,
  addTransaction: (newTransaction: ExecutionReceipt) => addNewTransaction(newTransaction, get, set),
  operations: [],
  addOperation: (newOperation: Operation) => {
    const operations = get().operations
    if (operations.length - 1 > MAX_TRANSACTION_HISTORY) operations.pop()
    operations.unshift(newOperation)
    set({
      operations,
    })
  },
})
