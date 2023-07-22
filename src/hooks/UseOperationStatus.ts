import { Operation, OperationStatus } from '@fun-xyz/core'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { useFunStoreInterface } from '..'
import { useFun } from './UseFun'

export const useOperationStatus = () => {
  const { funWallet } = useFun(
    (state: useFunStoreInterface) => ({
      funWallet: state.FunWallet,
    }),
    shallow
  )

  const [operationStatuses, setOperationStatuses] = useState<Operation[]>([])
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  const fetchOperations = useCallback(
    async (status: OperationStatus = OperationStatus.ALL) => {
      console.log('fetching operations', funWallet, fetching)
      if (funWallet == null) return
      if (fetching) return

      setFetching(true)
      const operations = await funWallet.getOperations(status)
      setOperationStatuses(operations)
      setFetching(false)
    },
    [fetching, funWallet]
  )

  useEffect(() => {
    console.log('should fetch operations', operationStatuses.length, fetched)
    if (operationStatuses.length > 0 || fetched || !funWallet) return
    fetchOperations()
    setFetched(true)
  }, [fetchOperations, fetched, funWallet, operationStatuses.length])

  return { operations: operationStatuses, loading: fetching, fetchOperations }
}
