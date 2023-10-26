![backdrop](./backdrop.png)

# **FunKit React**

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
"use client"; // All React hooks need to be used in a client context
import {
  FunContextProvider,
  Goerli,
  useMetamaskAuth,
  useFunWallet,
} from "@funkit/react";
```

### 2. Configure Funkit SDK

Set your environment variables describing how your smart wallets interact with blockchains. This can include chain, apiKey, optional gasSponsor, and connectors.

1. `chain` - Each FunWallet exists on an [EVM-compatible blockchain](https://ethereum.org/en/developers/docs/evm/).
2. `apiKey` - You can get an API key by logging to our [dashboard](https://app.fun.xyz/sign-in/request).
3. `gasSponsor` - All wallets have to pay gas to execute transactions on a blockchain. You can pre-fund the wallet with native tokens or you can have third parties to pay for gas by specifying a [gasSponsor](https://docs.fun.xyz/api-reference/gas-sponsor).
4. `connectors` - The login method for your users

Add your privy AppId as well to get full access to web2 sign in methods.

```jsx
const FUN_APP_ID = "clnatprpv00sfmi0fv3qc185b";
const DEFAULT_FUN_WALLET_CONFIG = {
  apiKey: "<YOUR_API_KEY>",
  chain: Goerli,
};

export default function AppWrapper() {
  return (
    <FunContextProvider options={DEFAULT_FUN_WALLET_CONFIG} appId={FUN_APP_ID}>
      <App />
    </FunContextProvider>
  );
}
```

### 3. User login through Metamask

Next, users need to login through connectors to provide a way for fun account abstraction to sign transactions. Here we add a button to activate/deactivate the connector upon click.

```jsx
const ConnectorButton = ({ index }) => {
  const { auth, active, authAddr, login, logout } = useMetamaskAuth();

  return (
    <button
      onClick={() => {
        if (active) {
          logout();
          return;
        }
        login();
      }}
    >
      {active ? "Unconnected" : "Connect"} {"Metamask "}
    </button>
  );
};
```

### 4. Initialize the FunWallet

With the Auth instance that you just created, you can now initialize your FunWallet. The useFunWallet hook returns functions used to create or initialize existing FunWallets.

```jsx
const { auth, active, authAddr, login, logout } = useMetamaskAuth();

const { wallet, address, createFunWallet } = useFunWallet();

async function CreateNewWallet() {
  if (!active || !auth) return;
  createFunWallet(auth).catch();
}
```

### 5. Initiate a Transfer

Now we have the wallet object, we will show how to transfer some basic ethers to other addresses. Note that the smart wallet will only be created on the blockchain after executeOperation is finished.

```jsx
const {
  executeOperation: executeTransferOperation,
  ready: actionTransferReady,
} = useAction({
  action: ActionType.Transfer,
  params: {
    token: "eth",
    to: authAddr,
    amount: 0.001,
  },
});

const transferEth = async () => {
  if (!wallet || !actionTransferReady) return;
  await executeTransferOperation();
};
```

## <a id="testing"></a> **Testing**

### **Testing on Goerli**

You can test FunKit on Ethereum goerli testnet with the following configuration. We have a gas sponsor that will cover your gas cost for the first 200 operations so you don’t have to worry about pre-funding the wallet or setting up the gas sponsor to start.

```jsx
const FUN_APP_ID = "clnatprpv00sfmi0fv3qc185b";
const DEFAULT_FUN_WALLET_CONFIG = {
  apiKey: "<YOUR_API_KEY>",
  chain: Goerli,
};
export default function AppWrapper() {
  return (
    <FunContextProvider options={DEFAULT_FUN_WALLET_CONFIG} appId={FUN_APP_ID}>
      <App />
    </FunContextProvider>
  );
}
```

## <a id="moreresources"></a> **More Resources**

- [Documentation](http://docs.fun.xyz) - Complete how-to guides and API reference docs.
- [Demo](https://demo.fun.xyz) - Try FunKit React in action.
- [Discord](https://discord.com/invite/KhJVrDy3) - Ask us a question, or just say hi!
