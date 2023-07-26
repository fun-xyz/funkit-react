import {
  AddOwnerParams,
  AddUserToGroupParams,
  ApproveParams,
  CreateGroupParams,
  FinishUnstakeParams,
  RemoveGroupParams,
  RemoveOwnerParams,
  RemoveUserFromGroupParams,
  RequestUnstakeParams,
  SessionKeyParams,
  StakeParams,
  SwapParam,
  TransactionParams,
  TransferParams,
  UpdateThresholdOfGroupParams,
} from '@fun-xyz/core'

export type FirstClassActionParams =
  | ISwapParams
  | ITransfer
  | IApprove
  | IStakeParams
  | IUnstakeParams
  | IExecRawTxParams
  | ICreateSessionKeyParams
  | IAddOwnerParams
  | IRemoveOwnerParams
  | ICreateGroupParams
  | IAddUserToGroupParams
  | IRemoveUserFromGroupParams
  | IUpdateThresholdOfGroupParams
  | IRemoveGroupParams

export enum ActionType {
  Swap = 'swap',
  Transfer = 'transfer',
  Approve = 'approve',
  Stake = 'stake',
  Unstake = 'unstake',
  ExecRawTx = 'execRawTx',
  createSessionKey = 'createSessionKey',
  addOwner = 'addOwner',
  removeOwner = 'removeOwner',
  createGroup = 'createGroup',
  addUserToGroup = 'addUserToGroup',
  removeUserFromGroup = 'removeUserFromGroup',
  updateThresholdOfGroup = 'updateThresholdOfGroup',
  removeGroup = 'removeGroup',
}

export interface ISwapParams {
  action: ActionType.Swap
  params: SwapParam
}
export interface ITransfer {
  action: ActionType.Transfer
  params: TransferParams
}

export interface IApprove {
  action: ActionType.Approve
  params: ApproveParams
}

export interface IStakeParams {
  action: ActionType.Stake
  params: StakeParams
}

export interface IUnstakeParams {
  action: ActionType.Unstake
  params: RequestUnstakeParams | FinishUnstakeParams
}

export interface IExecRawTxParams {
  action: ActionType.ExecRawTx
  params: TransactionParams
}

export interface ICreateSessionKeyParams {
  action: ActionType.createSessionKey
  params: SessionKeyParams
}

export interface IAddOwnerParams {
  action: ActionType.addOwner
  params: AddOwnerParams
}

export interface IRemoveOwnerParams {
  action: ActionType.removeOwner
  params: RemoveOwnerParams
}

export interface ICreateGroupParams {
  action: ActionType.createGroup
  params: CreateGroupParams
}

export interface IAddUserToGroupParams {
  action: ActionType.addUserToGroup
  params: AddUserToGroupParams
}

export interface IRemoveUserFromGroupParams {
  action: ActionType.removeUserFromGroup
  params: RemoveUserFromGroupParams
}

export interface IUpdateThresholdOfGroupParams {
  action: ActionType.updateThresholdOfGroup
  params: UpdateThresholdOfGroupParams
}

export interface IRemoveGroupParams {
  action: ActionType.removeGroup
  params: RemoveGroupParams
}
