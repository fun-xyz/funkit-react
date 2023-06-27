const erc20AbiSlice = [
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'spender',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: 'remaining',
        type: 'uint256',
      },
    ],
  },
]

export default erc20AbiSlice
