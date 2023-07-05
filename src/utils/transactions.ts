import {
  ApproveParams,
  Chain,
  ContractInterface,
  EnvOption,
  Eoa,
  ExecutionReceipt,
  FinishUnstakeParams,
  FunWallet,
  GaslessSponsor,
  isContract,
  RequestUnstakeParams,
  StakeParams,
  SwapParams,
  TokenSponsor,
  TransactionData,
  TransferParams,
  UserOp,
} from '@fun-xyz/core'

import {
  FunError,
  generateTransactionError,
  TransactionErrorGasSponsorBlacklist,
  TransactionErrorGasSponsorWhitelist,
  TransactionErrorInsufficientPaymasterAllowance,
  TransactionErrorLowFunWalletBalance,
} from '../store/plugins/ErrorStore'
import ERC20_ALLOWANCE from './miniAbi/ERC20Allowance'

export interface GasValidationResponse {
  valid: boolean
  error?: FunError
  allowance?: bigint
}

export const validateAndPrepareTransaction = async (build: any, Eoa: Eoa, wallet: FunWallet) => {
  try {
    const preparedTransaction = await prepareTransaction(build, Eoa, wallet)
    console.log('preparedTx', preparedTransaction)
    return { valid: true, preparedTransaction }
  } catch (err) {
    console.log(err)
    return {
      valid: false,
      error: { code: 0, message: 'Error Validating fetching sponsor Validation status', err },
    }
  }
}

// TODO allowance should be looked into for permit
// ask caleb how to validate
// validate allowance when needed on error
// deposit tokens directly into paymaster
// do they have enough balance to pay for tokens
// can we simulate locally
export const validateGasBehavior = async (config: EnvOption, wallet: FunWallet): Promise<GasValidationResponse> => {
  try {
    debugger
    const walletAddress = await wallet.getAddress()
    let currentChain = config.chain as Chain
    if (typeof config.chain === 'string' || typeof config.chain === 'number')
      currentChain = new Chain({ chainId: `${config.chain}` })
    const client = await currentChain.getClient()
    const iscontract = await isContract(walletAddress, client)
    if (config.gasSponsor) {
      // we know that its set to either gassless or a gas sponsor
      if (config.gasSponsor.token) {
        // erc20 Token sponsor
        console.log('erc20 Token sponsor')
        const gasSponsor = new TokenSponsor()
        const paymasterAddress = await gasSponsor.getPaymasterAddress()
        const ERC20Contract = new ContractInterface(ERC20_ALLOWANCE)
        const allowance: bigint = await ERC20Contract.readFromChain(
          config.gasSponsor.token as `0x${string}`,
          'allowance',
          [walletAddress, paymasterAddress],
          client
        )
        if (allowance === 0n)
          return {
            valid: false,
            error: generateTransactionError(TransactionErrorInsufficientPaymasterAllowance, { allowance }),
          }
        const gasValidation = await validateGasSponsorMode(
          gasSponsor,
          config.gasSponsor.sponsorAddress as string,
          walletAddress
        )
        if (!gasValidation.valid) return gasValidation
        return { valid: true, allowance }
      } else {
        // gassless sponsor
        console.log('gassless sponsor')
        const gasSponsor = new GaslessSponsor()
        const gasValidation = await validateGasSponsorMode(
          gasSponsor,
          config.gasSponsor.sponsorAddress as string,
          walletAddress
        )
        if (!gasValidation.valid) return gasValidation
        // check if the sponsor has enough ether?
        return { valid: true }
      }
    } else {
      console.log("No sponsor, let's check the wallet balance")
      const etherBalance = await client.getBalance({ address: walletAddress })
      if (etherBalance === 0n) return { valid: false, error: TransactionErrorLowFunWalletBalance }
      const gasPrice = await client.getGasPrice()
      console.log('etherBalance', etherBalance, gasPrice)
      if (etherBalance < gasPrice * 100000n)
        return {
          valid: false,
          error: generateTransactionError(TransactionErrorLowFunWalletBalance, { amount: etherBalance }),
        }
      if (iscontract && etherBalance < gasPrice * 1500000n)
        return {
          valid: false,
          error: generateTransactionError(TransactionErrorLowFunWalletBalance, { amount: etherBalance }),
        }
      return { valid: true }
    }
  } catch (err) {
    return {
      valid: false,
      error: { code: 0, message: 'Error Validating fetching sponsor Validation status', err },
    }
  }
}

export const validateGasSponsorMode = async (
  gasSponsor: TokenSponsor | GaslessSponsor,
  sponsorAddress: string,
  walletAddress: string
): Promise<GasValidationResponse> => {
  const getBlackListedFunc = gasSponsor[`getSpenderBlacklisted`] ?? gasSponsor[`getSpenderBlacklistMode`]
  const getWhiteListedFunc = gasSponsor[`getSpenderWhitelisted`] ?? gasSponsor[`getSpenderWhitelistMode`]
  if (getBlackListedFunc == null || getWhiteListedFunc == null)
    return { valid: false, error: { code: 0, message: 'Gas Sponsor undefined' } }
  try {
    if (await gasSponsor.getListMode(sponsorAddress)) {
      // check if the sponsor is in the blacklist
      const isBlackListed = await getBlackListedFunc(walletAddress, sponsorAddress)
      if (isBlackListed)
        return {
          valid: false,
          error: generateTransactionError(TransactionErrorGasSponsorBlacklist, { sponsorAddress, walletAddress }),
        }
    } else {
      // check if the sponsor is in the whitelist
      const isWhiteListed = await getWhiteListedFunc(walletAddress, sponsorAddress)
      if (!isWhiteListed)
        return {
          valid: false,
          error: generateTransactionError(TransactionErrorGasSponsorWhitelist, { sponsorAddress, walletAddress }),
        }
    }
    return {
      valid: true,
    }
  } catch (err) {
    return {
      valid: false,
      error: { code: 0, message: 'Error Validating fetching sponsor mode Validation status', err },
    }
  }
}

// quick helper function which takes a build and returns a transactionOpts object
export const prepareTransaction = async (build: any, Eoa: Eoa, wallet: FunWallet): Promise<UserOp> => {
  return new Promise((resolve, reject) => {
    if (!build.type) reject('No type specified')
    if (!wallet[build.type]) reject('Invalid type')
    if (!build.txParams) reject('No txParams specified')
    wallet[build.type](
      Eoa,
      build.txParams as (((((TransferParams & ApproveParams) & SwapParams) & StakeParams) &
        (RequestUnstakeParams | FinishUnstakeParams)) &
        (EnvOption | undefined)) &
        TransactionData,
      { ...build.txOptions, sendLater: true }
    )
      .then((preparedTx) => {
        console.log('preparedTx', preparedTx)
        resolve(preparedTx)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// function which takes a userOp and executes it
export const executePreparedTransaction = async (preparedTx: UserOp, wallet: FunWallet): Promise<ExecutionReceipt> => {
  return new Promise((resolve, reject) => {
    wallet
      .sendTx(preparedTx)
      .then((txReceipt) => {
        resolve(txReceipt)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
