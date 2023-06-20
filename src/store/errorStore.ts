export interface FunError {
  code: number // easy access code
  message: string // description with resolution
  link?: string // link to documentation if it exists
  err?: Error | unknown // the error object if needed
}

export interface ErrorStoreInterface {
  error: FunError | null
  errors: FunError[]
  setFunError: (error: FunError) => void
  setTempError: (error: FunError) => void
  resetFunError: () => void
  resetFunErrors: () => void
}

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
