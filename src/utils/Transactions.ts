import {
  ApproveParams,
  Auth,
  Chain,
  ContractInterface,
  EnvOption,
  FinishUnstakeParams,
  FunWallet,
  GaslessSponsor,
  isContract,
  RequestUnstakeParams,
  StakeParams,
  SwapParam,
  TokenSponsor,
  TransactionData,
  TransferParams,
  UserOperation,
} from '@fun-xyz/core'

import {
  FunError,
  generateTransactionError,
  TransactionErrorGasSponsorBlacklist,
  TransactionErrorGasSponsorWhitelist,
  TransactionErrorInsufficientPaymasterAllowance,
  TransactionErrorLowFunWalletBalance,
} from '../store/plugins/ErrorStore'
import ERC20_ALLOWANCE_BALANCE from './miniAbi/ERC20AllowanceBalance.json'

export type transactionTypes = 'transfer' | 'approve' | 'swap' | 'stake' | 'unstake' | 'create' | 'execRawTx'
export type transactionParams =
  | TransferParams
  | ApproveParams
  | SwapParam
  | StakeParams
  | RequestUnstakeParams
  | FinishUnstakeParams
  | TransactionData

export interface IOperationsArgs {
  type: transactionTypes
  txParams: transactionParams
  txOptions?: EnvOption
}

export function checkTransactionType(txArgs: IOperationsArgs): boolean {
  switch (txArgs.type) {
    case 'transfer':
      if (
        (txArgs.txParams['to'] && txArgs.txParams['amount']) || // NATIVE TRANSFER
        (txArgs.txParams['to'] && txArgs.txParams['amount'] && txArgs.txParams['token']) || // ERC20 Transfer
        (txArgs.txParams['to'] && txArgs.txParams['tokenId'] && txArgs.txParams['token']) // ERC721 Transfer
      )
        return true
      return false
    case 'approve':
      if (
        (txArgs.txParams['spender'] && txArgs.txParams['token'] && txArgs.txParams['amount']) || // ERC20 Approve
        (txArgs.txParams['spender'] && txArgs.txParams['token'] && txArgs.txParams['tokenId']) // ERC721 Approve
      )
        return true
      return false
    case 'swap':
      if (txArgs.txParams['in'] && txArgs.txParams['out'] && txArgs.txParams['amount']) return true
      return false
    case 'stake':
      if (
        txArgs.txParams['amount'] &&
        !txArgs.txParams['in'] &&
        !txArgs.txParams['token'] &&
        !txArgs.txParams['spender']
      )
        return true
      return false
    case 'unstake':
      if (
        txArgs.txParams['recipient'] &&
        !txArgs.txParams['in'] &&
        !txArgs.txParams['token'] &&
        !txArgs.txParams['spender']
      )
        return true
      return false
    case 'execRawTx':
      if (txArgs.txParams['to'] && !txArgs.txParams['in'] && !txArgs.txParams['token'] && !txArgs.txParams['spender'])
        return true
      return false
    default:
      return false
  }
}

export interface GasValidationResponse {
  valid: boolean
  error?: FunError
  allowance?: bigint
}

/**
 * Validates and prepares a transaction for execution.
 * @param build - The transaction build object.
 * @param Auth - The Auth object.
 * @param wallet - The FunWallet object.
 * @returns An object containing a boolean indicating whether the validation was successful, and the prepared transaction if successful.
 */
export const validateAndPrepareTransaction = async (build: any, Auth: Auth, wallet: FunWallet) => {
  try {
    const preparedTransaction = await prepareTransaction(build, Auth, wallet)
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

/**
 * Validates the gas behavior of a transaction and prepares it for execution.
 * @param config - The environment configuration object.
 * @param wallet - The FunWallet object.
 * @returns An object containing a boolean indicating whether the validation was successful, the allowance if applicable, and an error object if the validation failed.
 */
export const validateGasBehavior = async (config: EnvOption, wallet: FunWallet): Promise<GasValidationResponse> => {
  try {
    // debugger
    const walletAddress = await wallet.getAddress()
    let currentChain = config.chain as Chain
    if (typeof config.chain === 'string' || typeof config.chain === 'number')
      currentChain = await Chain.getChain({ chainIdentifier: `${config.chain}` })
    const client = await currentChain.getClient()
    const iscontract = await isContract(walletAddress, client)
    if (config.gasSponsor) {
      // we know that its set to either gassless or a gas sponsor
      if (config.gasSponsor.token) {
        // erc20 Token sponsor
        const gasSponsor = new TokenSponsor(config)
        const paymasterAddress = await gasSponsor.getPaymasterAddress()
        const ERC20Contract = new ContractInterface(ERC20_ALLOWANCE_BALANCE.abi)

        const [allowance, balance]: bigint[] = await Promise.all([
          ERC20Contract.readFromChain(
            config.gasSponsor.token as `0x${string}`,
            'allowance',
            [walletAddress, paymasterAddress],
            client
          ),
          ERC20Contract.readFromChain(config.gasSponsor.token as `0x${string}`, 'balanceOf', [walletAddress], client),
        ])
        if (allowance === 0n)
          return {
            valid: false,
            error: generateTransactionError(TransactionErrorInsufficientPaymasterAllowance, {
              allowance,
              paymasterAddress,
            }),
          }

        if (balance === 0n)
          return {
            valid: false,
            error: generateTransactionError(TransactionErrorLowFunWalletBalance, {
              balance,
            }),
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
        const gasSponsor = new GaslessSponsor()
        try {
          const gasValidation = await validateGasSponsorMode(
            gasSponsor,
            config.gasSponsor.sponsorAddress as string,
            walletAddress
          )
          if (!gasValidation.valid) return gasValidation
          // check if the sponsor has enough ether?
          return { valid: true }
        } catch (err) {
          return { valid: false }
        }
      }
    } else {
      const etherBalance = await client.getBalance({ address: walletAddress })
      if (etherBalance === 0n) return { valid: false, error: TransactionErrorLowFunWalletBalance }
      const gasPrice = await client.getGasPrice()
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
    console.log('========= Error:', err)
    return {
      valid: false,
      error: { code: 0, message: 'Error Validating fetching sponsor Validation status', err },
    }
  }
}

/**
 * Validates the gas sponsor mode of a transaction and prepares it for execution.
 * @param gasSponsor - The gas sponsor object.
 * @param sponsorAddress - The address of the gas sponsor.
 * @param walletAddress - The address of the wallet.
 * @returns An object containing a boolean indicating whether the validation was successful, and an error object if the validation failed.
 */
export const validateGasSponsorMode = async (
  gasSponsor: TokenSponsor | GaslessSponsor,
  sponsorAddress: string,
  walletAddress: string
): Promise<GasValidationResponse> => {
  let getBlackListedPromise: Promise<boolean>
  let getWhiteListedPromise: Promise<boolean>

  if (gasSponsor instanceof GaslessSponsor) {
    getBlackListedPromise = gasSponsor.getSpenderBlacklistMode(walletAddress, sponsorAddress)
    getWhiteListedPromise = gasSponsor.getSpenderWhitelistMode(walletAddress, sponsorAddress)
  } else if (gasSponsor instanceof TokenSponsor) {
    getBlackListedPromise = gasSponsor.getSpenderBlacklisted(walletAddress, sponsorAddress)
    getWhiteListedPromise = gasSponsor.getSpenderWhitelisted(walletAddress, sponsorAddress)
  } else {
    return {
      valid: false,
      error: { code: 0, message: 'Gas Sponsor undefined' },
    }
  }

  try {
    const listMode = await gasSponsor.getListMode(sponsorAddress)

    const isBlackListed = await getBlackListedPromise
    const isWhiteListed = await getWhiteListedPromise

    if (listMode) {
      if (isBlackListed) {
        return {
          valid: false,
          error: generateTransactionError(TransactionErrorGasSponsorBlacklist, { sponsorAddress, walletAddress }),
        }
      }
    } else {
      if (!isWhiteListed) {
        return {
          valid: false,
          error: generateTransactionError(TransactionErrorGasSponsorWhitelist, { sponsorAddress, walletAddress }),
        }
      }
    }

    return {
      valid: true,
    }
  } catch (err) {
    console.log('Error:', err)
    return {
      valid: false,
      error: { code: 0, message: 'Error validating fetching sponsor mode validation status', err },
    }
  }
}

/**
 * Prepares a transaction for execution.
 * @param build - The transaction build object.
 * @param Auth - The Auth object.
 * @param wallet - The FunWallet object.
 * @returns A promise that resolves with a UserOperation object representing the prepared transaction, or rejects with an error message.
 */
export const prepareTransaction = async (build: any, Auth: Auth, wallet: FunWallet): Promise<UserOperation> => {
  return new Promise((resolve, reject) => {
    if (!build.type) reject('No type specified')
    if (!wallet[build.type]) reject('Invalid type')
    if (!build.txParams) reject('No txParams specified')
    wallet[build.type](
      Auth,
      build.txParams as (((((TransferParams & ApproveParams) & SwapParam) & StakeParams) &
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

// /**
//  * Executes a prepared transaction.
//  * @param preparedTx - The prepared transaction to execute.
//  * @param wallet - The FunWallet object.
//  * @returns A promise that resolves with the execution receipt, or rejects with an error message.
//  */
// export const executePreparedTransaction = async (preparedTx: UserOperation, wallet: FunWallet): Promise<ExecutionReceipt> => {
//   return new Promise((resolve, reject) => {
//     wallet
//       .sendTx(preparedTx)
//       .then((txReceipt) => {
//         resolve(txReceipt)
//       })
//       .catch((err) => {
//         reject(err)
//       })
//   })
// }

export const estimateGas = async (build: IOperationsArgs, Auth: Auth, wallet: FunWallet) => {
  return new Promise((resolve, reject) => {
    if (Auth == null) reject('No Auth')
    if (wallet == null) reject('No wallet')
    FunWallet[build.type](
      Auth,
      build.txParams as (((((TransferParams & ApproveParams) & SwapParam) & StakeParams) &
        (RequestUnstakeParams | FinishUnstakeParams)) &
        (EnvOption | undefined)) &
        TransactionData,
      build.txOptions,
      true // estimateGas
    )
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        console.log('GasEstimationError Error: ', err)
      })
  })
}
