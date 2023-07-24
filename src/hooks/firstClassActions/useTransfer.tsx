import { EnvOption, ExecutionReceipt, Operation, TransferParams } from '@fun-xyz/core'
import { Auth } from '@fun-xyz/core'
import { useCallback, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  FunError,
  generateTransactionError,
  TransactionErrorCatch,
  TransactionErrorMissingWallet,
  useFunStoreInterface,
} from '@/store'

import { useFun } from '../UseFun'

export interface ITransferParams {
  params: TransferParams
  txOptions?: EnvOption
}

export const useTransfer = (build: ITransferParams) => {
  const { wallet, primaryAuth } = useFun(
    (state: useFunStoreInterface) => ({
      wallet: state.FunWallet,
      primaryAuth: state.Auth,
    }),
    shallow
  )
  const [sending, setSending] = useState<boolean>(false)
  const [receipt, setReceipt] = useState<ExecutionReceipt | Operation | null>(null)
  const [txError, setTxError] = useState<FunError | null>(null)

  const transfer = useCallback(
    async (auth?: Auth[]) => {
      if (sending) return
      if (wallet == null) {
        setTxError(generateTransactionError(TransactionErrorMissingWallet, { build }))
        return
      }
      const firstSigner = auth && auth.length > 0 ? auth[0] : primaryAuth
      if (firstSigner == null) return // no signer error
      setSending(true)
      try {
        const userId = await firstSigner.getUserId()
        const UserOp = await wallet.transfer(firstSigner, userId, build.params, build.txOptions)
        // handle more than one signer case here
        setReceipt(UserOp)
        setSending(false)
        return UserOp
        // check if there are any other signers which could sign the transaction to execute it fully
      } catch (error) {
        setTxError(
          generateTransactionError(
            TransactionErrorCatch,
            {
              build,
            },
            error
          )
        )
        setSending(false)
        return null
      }
    },
    [build, primaryAuth, sending, wallet]
  )

  return {
    sending,
    receipt,
    txError,
    transfer,
  }
}
