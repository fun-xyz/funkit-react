import { Operation, OperationStatus } from '@funkit/core'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { useFunStoreInterface } from '../..'
import { useFun } from '../UseFun'
import { usePrevious } from '../util'

export const useOperationStatus = (status: OperationStatus = OperationStatus.ALL) => {
  const { funWallet, account } = useFun(
    (state: useFunStoreInterface) => ({
      funWallet: state.FunWallet,
      account: state.account,
    }),
    shallow
  )

  const [operationStatuses, setOperationStatuses] = useState<Operation[]>([])
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const prevAccount = usePrevious(account)

  const fetchOperations = useCallback(async () => {
    if (funWallet == null) return
    if (fetching) return

    setFetching(true)
    try {
      const operations = await funWallet.getOperations(status)

      if (operations == null) return setOperationStatuses([])
      setOperationStatuses(operations.sort((a, b) => Number(b.proposedTime) - Number(a.proposedTime)))
    } catch (e) {
      console.error(e)
      setOperationStatuses([])
    } finally {
      setFetching(false)
    }
    // console.log('fetched operations', operations, funWallet, await funWallet.getAddress())
  }, [fetching, funWallet, status])

  useEffect(() => {
    if (prevAccount !== account && fetched) setFetched(false) // reset fetch if the account changed
    if (operationStatuses.length > 0 || fetched || !funWallet) return
    fetchOperations()
    setFetched(true)
  }, [account, fetchOperations, fetched, funWallet, operationStatuses.length, prevAccount])

  return { operations: operationStatuses, loading: fetching, fetchOperations }
}
