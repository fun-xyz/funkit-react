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
  SwapParams,
  TransactionParams,
  TransferParams,
  UpdateThresholdOfGroupParams,
} from '@funkit/core'

export type FirstClassActionParams =
  | ISwapParams
  | ITransfer
  | IApprove
  | IStakeParams
  | IUnstakeParams
  | ICreateSessionKeyParams
  | IAddOwnerParams
  | IRemoveOwnerParams
  | ICreateGroupParams
  | IAddUserToGroupParams
  | IRemoveUserFromGroupParams
  | IUpdateThresholdOfGroupParams
  | IRemoveGroupParams
  | ITransactionParams
  | ICreate

export enum ActionType {
  Swap = 'swap',
  Transfer = 'transfer',
  Approve = 'tokenApprove',
  Stake = 'stake',
  Unstake = 'unstake',
  createSessionKey = 'createSessionKey',
  addOwner = 'addOwner',
  removeOwner = 'removeOwner',
  createGroup = 'createGroup',
  addUserToGroup = 'addUserToGroup',
  removeUserFromGroup = 'removeUserFromGroup',
  updateThresholdOfGroup = 'updateThresholdOfGroup',
  removeGroup = 'removeGroup',
  createOperation = 'createOperation',
  create = 'create',
}

export interface ICreate {
  action: ActionType.create
  params: null
}

export interface ITransactionParams {
  action: ActionType.createOperation
  params: TransactionParams
}

export interface ISwapParams {
  action: ActionType.Swap
  params: SwapParams
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
