# A react interface for interacting with fun wallets.


Use hooks to manage and configure fun wallets and simplify the fun wallet SDK. The Fun wallet react SDK comes pre built with a centralized access model which creates a single source of truth in your application. The SDK currently supports a variety of Eoa connectors out of the box as well as Social logins.

### Currently supported Connectors

1. Metamask
2. Coinbase Wallet
3. Wallet Connect
4. any injected connector
5. Social Logins
    - Google
    - Twitter
    - Apple 
    - Discord


### Initialization hook 

```ts
    const DEFAULT_FUN_WALLET_CONFIG = {
        apiKey: "YOUR API KEY",
        chain: "ethereum-goerli",
    };
    const {
        connectors,
        account,
        index,
        error,
        loading,
        activateConnector,
        initializeSingleAuthWallet,
        initializeMultiAuthWallet,
    } = useBuildFunWallet({ config: DEFAULT_FUN_WALLET_CONFIG });
```


### Accessing Data 

```ts
    import { useFun, ShallowEqual } from 'fun-wallet-react'

    const { account, FunWallet, supportedChains, switchChain, errors } = useFun((state: useFunStoreInterface) => ({
            account: state.account,
            FunWallet: state.FunWallet,
            supportedChains: state.supportedChains,
            switchChain: state.switchChain,
            errors: state.errors
    }), ShallowEqual);
```