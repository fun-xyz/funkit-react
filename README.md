![backdrop](./backdrop.png)

# **FunKit**

FunKit empowers you to create feature-rich and extensible smart wallets built on account abstraction. Leveraging the FunKit, you can customize gas behavior, adopt multi-sig and common authentication method, monetize your application, execute any transactions from smart wallets, and much more.

This repo only covers FunKit React SDK which means to simplify the development experience of using fun account abstraction wallet for frontend. Check our [Core SDK](https://github.com/fun-xyz/funkit-core) if you focus more on backend or do not want to use react hooks.

## **Table of Contents**

1. **[Installation](#installation)**
2. **[Quick Start](#quickstart)**
3. **[Testing](#testing)**
4. **[More Resources](#moreresources)**

## <a id="installation"></a> **Installation**

```
npm i @funkit/react --save
# or
yarn add @funkit/react
```

## <a id="quickstart"></a> **Quick Start**

FunKit needs to be configured with an API key. Get a key by logging to our [dashboard](https://app.fun.xyz/sign-in/request).

### 1. Import

Import all required classes.

```js
import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  usePrimaryAuth,
} from "@funkit/react";
import { useState } from "react";
```

### 2. Configure wallet environment

Set your environment variables describing how your smart wallets interact with blockchains. This can include chain, apiKey, optional gasSponsor, and connectors.

1. `chain` - Each FunWallet exists on an [EVM-compatible blockchain](https://ethereum.org/en/developers/docs/evm/).
2. `apiKey` - You can get an API key by logging to our [dashboard](https://app.fun.xyz/sign-in/request).
3. `gasSponsor` - All wallets have to pay gas to execute transactions on a blockchain. You can pre-fund the wallet with native tokens or you can have third parties to pay for gas by specifying a [gasSponsor](https://docs.fun.xyz/api-reference/gas-sponsor).
4. `connectors` - The login method for your users

```jsx
configureNewFunStore({
  config: {
    chain: CHAIN_ID,
    apiKey: API_KEY,
    gasSponsor: {
      sponsorAddress: SPONSOR_ADDRESS,
    },
  },
  connectors: [MetamaskConnector()],
});
```

### 3. User login through connector

Next, users need to login through connectors to provide a way for fun account abstraction to sign transactions. Here we add a button to activate/deactivate the connector upon click.

```jsx
const ConnectorButton = ({ index }) => {
  const { active, activate, deactivate, connectorName, connector } = useConnector({ index });

  return (
    <button
      onClick={() => {
        if (active) {
          deactivate(connector);
          return;
        }
        activate(connector);
      })
    >
      {active ? "Unconnected" : "Connect"} {connectorName}{" "}
    </button>
  );
};
```

### 4. Initialize the FunWallet

With the Auth instance that you just created, you can now initialize your FunWallet. Here are the FunWallet constructor parameters:

1. `users` - This is a `User[]` that holds all `users` that can access your `FunWallet`. For simplicity, we’re only including 1 user here.
2. `uniqueId` - This is a random seed that is generated from our `Auth` instance. The purpose of this seed is to generate the `address` of our `FunWallet`.

```jsx
const { account: connectorAccount } = useConnector({
  index: 0,
  autoConnect: true,
});
const { initializeFunAccount, funWallet } = useCreateFun();
const [auth] = usePrimaryAuth();

const initializeSingleAuthFunAccount = async () => {
  if (!connectorAccount) {
    console.log("Please connect your wallet first!");
    return;
  }
  initializeFunAccount({
    users: [{ userId: convertToValidUserId(connectorAccount) }],
    uniqueId: await auth.getWalletUniqueId(),
  }).catch();
};
```

### 5. Initiate a Transfer

Now we have the wallet object, we will show how to transfer some basic ethers to other addresses. Note that the smart wallet will only be created on the blockchain after executeOperation is finished.

```jsx
const transferEth = async () => {
  if (!connectorAccount) {
    console.log("Please connect your wallet first!");
    return;
  }
  const op = await funWallet.transfer(auth, await auth.getUserId(), {
    token: "eth",
    to: await auth.getAddress(),
    amount: AMOUNT,
  });
  setLoadings({ ...loadings, transfer: true });
  const receipt = await funWallet.executeOperation(auth, op);
  setTxIds({ ...txIds, transfer: receipt.txId });
  setLoadings({ ...loadings, transfer: false });
};
```

## <a id="testing"></a> **Testing**

### **Testing on Goerli**

You can test FunKit on Ethereum goerli testnet with the following configuration. We have a gas sponsor that will cover your gas cost for the first 200 operations so you don’t have to worry about pre-funding the wallet or setting up the gas sponsor to start.

```jsx
configureNewFunStore({
  config: {
    chain: "goerli",
    apiKey: API_KEY,
    gasSponsor: {
      sponsorAddress: "0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad",
    },
  },
  connectors: [MetamaskConnector()],
});
```

## <a id="moreresources"></a> **More Resources**

- [Documentation](http://docs.fun.xyz) - Complete how-to guides and API reference docs.
- [Demo](https://demo.fun.xyz) - Try it out.
- [Discord](https://discord.gg/7ZRAv4es) - Say hi!
