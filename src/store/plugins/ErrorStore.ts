export interface FunErrorData {
  amount?: number | bigint
  token?: string
  [key: string]: any
}

export interface FunError {
  code: number // easy access code
  message: string // description with resolution
  data?: FunErrorData // any data that might be needed
  link?: string // link to documentation if it exists
  err?: Error | unknown // the error object if needed
}

export interface ErrorStoreInterface {
  txError: FunError | null
  error: FunError | null
  errors: FunError[]
  setFunError: (error: FunError) => void
  setTempError: (error: FunError) => void
  setTxError: (error: FunError) => void
  resetFunError: () => void
  resetFunErrors: () => void
  resetTxError: () => void
}

export const configureErrorStore = (get: any, set: any): ErrorStoreInterface => ({
  error: null,
  errors: [],
  txError: null,
  setFunError: (error: FunError) => {
    const { errors } = get()
    if (errors.length === 10) errors.pop()
    set({ error, errors: [error].concat(errors) })
  },
  setTempError: (error: FunError) => {
    const { errors } = get()
    if (errors.length === 10) errors.pop()
    set({ error, errors: [error].concat(errors) })
    setTimeout(() => set({ error: null }), 5000)
  },
  setTxError: (txError: FunError) => set({ txError }),
  resetFunError: () => set({ error: null }),
  resetFunErrors: () => set({ errors: [] }),
  resetTxError: () => set({ txError: null }),
})

export const GeneralFunError: FunError = {
  code: 0,
  message: 'Error',
}

export const MissingConfigError: FunError = {
  code: 1,
  message: 'Missing Fun Environment Config',
  link: 'https://docs.fun.xyz/how-to-guides/configure-environment',
}

export const MissingApiKeyError: FunError = {
  code: 2,
  message: 'Missing API key in Config',
  link: 'https://docs.fun.xyz/how-to-guides/configure-environment',
}

export const MissingActiveSigner: FunError = {
  code: 3,
  message: 'No active signer. Activate a connector before calling this function',
  link: 'https://docs.fun.xyz/how-to-guides/configure-account/auth-types',
}

export const NoMetaMaskError: FunError = {
  code: 1001,
  message: 'Metamask or injected connector not installed or disabled',
}

export const LegacyAuthIdMultiAccountError: FunError = {
  code: 3000,
  message:
    'One or more authId is already linked to a different FunWallet. Disconnect the account which has already been linked and try again.',
}

export const TransactionErrorCatch: FunError = {
  code: 4000,
  message: 'Unable to validate transaction. Caught error',
  data: {
    location: '',
  },
}

export const TransactionErrorLowFunWalletBalance: FunError = {
  code: 4001,
  message: 'Insufficient balance in FunWallet to complete transaction',
  data: {
    amount: 0,
  },
}

export const TransactionErrorInsufficientPaymasterAllowance: FunError = {
  code: 4002,
  message: 'Token paymaster is not approved to spend the required amount of tokens',
  data: {
    allowance: 0,
  },
}

export const TransactionErrorGasSponsorBlacklist: FunError = {
  code: 4003,
  message: 'Gas Sponsor has blacklisted your address',
  data: {
    sponsorAddress: '',
    walletAddress: '',
  },
}

export const TransactionErrorGasSponsorWhitelist: FunError = {
  code: 4004,
  message: 'Gas Sponsor has not whitelisted your address',
  data: {
    sponsorAddress: '',
    walletAddress: '',
  },
}
export const TransactionErrorMissingOrIncorrectFields: FunError = {
  code: 4005,
  message: 'Missing required fields or incorrect types',
  data: {},
}
export const TransactionErrorEstimateGasFailed: FunError = {
  code: 4006,
  message: 'Gas estimation failed for transaction type',
  data: {},
}
export const GetAssetsError: FunError = {
  code: 4007,
  message: 'Failed to get assets of FunWallet.',
  data: {},
}

export const generateTransactionError = (error: FunError, data: FunErrorData, err?: unknown): FunError => {
  return {
    ...error,
    ...data,
    err,
  }
}
