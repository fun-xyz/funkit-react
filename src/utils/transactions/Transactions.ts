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
  Operation,
  OperationType,
  RequestUnstakeParams,
  StakeParams,
  SwapParams,
  TokenSponsor,
  TransactionData,
  TransferParams,
  User,
} from '@fun-xyz/core'
import { Address } from 'viem'

import { IActiveAuthList } from '@/hooks/util'

import {
  FunError,
  generateTransactionError,
  TransactionErrorGasSponsorBlacklist,
  TransactionErrorGasSponsorWhitelist,
  TransactionErrorInsufficientPaymasterAllowance,
  TransactionErrorLowFunWalletBalance,
} from '../../store/plugins/ErrorStore'
import ERC20_ALLOWANCE_BALANCE from '../miniAbi/ERC20AllowanceBalance.json'
import { convertToValidUserId } from '../MultiAuth'

export type transactionTypes = 'transfer' | 'approve' | 'swap' | 'stake' | 'unstake' | 'create' | 'execRawTx'
export type transactionParams =
  | TransferParams
  | ApproveParams
  | SwapParams
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
    getBlackListedPromise = gasSponsor.getSpenderBlacklistMode(walletAddress as Address, sponsorAddress as Address)
    getWhiteListedPromise = gasSponsor.getSpenderWhitelistMode(walletAddress as Address, sponsorAddress as Address)
  } else if (gasSponsor instanceof TokenSponsor) {
    getBlackListedPromise = gasSponsor.getSpenderBlacklisted(walletAddress as Address, sponsorAddress as Address)
    getWhiteListedPromise = gasSponsor.getSpenderWhitelisted(walletAddress as Address, sponsorAddress as Address)
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

export const estimateGas = async (build: IOperationsArgs, Auth: Auth, wallet: FunWallet) => {
  return new Promise((resolve, reject) => {
    if (Auth == null) reject('No Auth')
    if (wallet == null) reject('No wallet')
    FunWallet[build.type](
      Auth,
      build.txParams as (((((TransferParams & ApproveParams) & SwapParams) & StakeParams) &
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

export interface IRemainingSigners {
  operation: Operation
  activeUser: User
  activeClients: IActiveAuthList[]
  firstSigner: string | `0x${string}` | null
}

export interface IRemainingSignersResponse {
  remainingConnectedSigners: { userId: string; auth: Auth }[]
  signerCount: number
  threshold: number
}

export const remainingConnectedSignersForOperation = ({
  operation,
  activeUser,
  activeClients,
  firstSigner,
}: IRemainingSigners): IRemainingSignersResponse => {
  if (operation.opType === OperationType.SINGLE_OPERATION || activeUser.groupInfo == null)
    return { remainingConnectedSigners: [], signerCount: operation.signatures?.length ?? 0, threshold: 1 }
  const currentClients = activeClients.filter((client) => client.userId != null)
  const currentSigners = operation.signatures
  // if there are no signers then we need to sign with all the required signers
  console.log('fetching Remaining Signers: ', currentSigners, currentClients)

  // handle the case where this is the first signature. It should return all the connected signers
  if (currentSigners == null || currentSigners.length == 0) {
    console.log("First Signer, so we'll return all the connected signers")
    const remainingConnectedSigners = currentClients
      .map(({ userId, provider }) => {
        if (userId == firstSigner) return undefined
        const isRequiredSignature = activeUser.groupInfo?.memberIds.includes(userId as `0x${string}`)
        if (isRequiredSignature) return { userId, auth: new Auth({ provider }) }
        else return undefined
      })
      .filter((signer) => signer != null) as { userId: string; auth: Auth }[]
    return { remainingConnectedSigners, signerCount: 0, threshold: activeUser.groupInfo?.threshold }
  }
  // if the number of signers is greater than or equal to the threshold then we don't need to sign anymore so no need to calculate additonal signers
  if (currentSigners?.length >= activeUser.groupInfo?.threshold) {
    console.log('remainingSigners, Threshold met')
    return {
      remainingConnectedSigners: [],
      signerCount: currentSigners?.length,
      threshold: activeUser.groupInfo?.threshold,
    }
  }
  console.log('returning all signers that are connected')
  const remainingConnectedSigners = currentClients
    .map(({ userId, provider }) => {
      if (userId == firstSigner) return undefined
      const isRequiredSignature = activeUser.groupInfo?.memberIds.includes(userId as `0x${string}`)
      if (!isRequiredSignature) return undefined
      // TODO remove the to Lower case when the server enforces lower case userIds
      const foundSignature = currentSigners.find((signer) => convertToValidUserId(signer.userId) === userId)
      if (foundSignature == null) {
        return { userId, auth: new Auth({ provider }) }
      } else {
        return undefined
      }
    })
    .filter((signer) => {
      return signer != null
    }) as { userId: string; auth: Auth }[]
  return {
    remainingConnectedSigners,
    signerCount: currentSigners?.length,
    threshold: activeUser.groupInfo?.threshold ?? 1,
  }
}

export interface SignUntilExecuteParams {
  wallet: FunWallet
  remainingConnectedSigners: { userId: string; auth: Auth }[]
  threshold: number
  operation: Operation
  firstSigner: Auth
  txOptions?: EnvOption
}

export const signUntilExecute = async ({
  wallet,
  remainingConnectedSigners,
  threshold,
  operation,
  firstSigner,
  txOptions,
}: SignUntilExecuteParams) => {
  if (threshold === 1) {
    console.log('signing with first signer', firstSigner, operation)
    return await wallet.executeOperation(firstSigner, operation, txOptions)
  } else {
    let count = 1
    for (let i = 0; i < remainingConnectedSigners.length; i++) {
      const currentAuth = remainingConnectedSigners[i].auth

      if (count + 1 >= threshold) {
        console.log('Final signature, executing operation: ', currentAuth, operation)
        return await wallet.executeOperation(currentAuth, operation, txOptions)
      } else {
        console.log('Signing with: ', currentAuth, operation)
        wallet
          .signOperation(currentAuth, operation, txOptions)
          .then(() => {
            count++
          })
          .catch((err) => {
            // we want to catch issues here because they may have rejected the signature on purpose
            console.log('error signing operation', err)
          })
      }
    }
    console.log("returning operation because we didn't have enough signatures")
    return operation
  }
}
