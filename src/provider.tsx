import { Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import React, { useContext } from "react";
import type { Networkish } from "@ethersproject/networks";
import type { BaseProvider, Web3Provider } from "@ethersproject/providers";
import type { Connector, Web3ReactStore } from "@web3-react/types";
import type { Context, ReactNode } from "react";

/**
 * @param children - A React subtree that needs access to the context.
 * @param connectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * If modified in place without re-rendering the parent component, will result in an error.
 * @param network - An optional argument passed along to `useSelectedProvider`.
 * @param lookupENS - A flag to enable/disable ENS lookups.
 */
export interface Web3ReactProviderProps {
  children: ReactNode;
  connectors:
    | [Connector, Web3ReactHooks][]
    | [Connector, Web3ReactHooks, Web3ReactStore][];
  network?: Networkish;
  lookupENS?: boolean;
}

export const FunWalletProvider = ({
  children,
  connectors,
  network,
  lookupENS = true,
}: Web3ReactProviderProps) => {
  return (
    <Web3ReactProvider
      connectors={connectors}
      network={network}
      lookupENS={lookupENS}
    >
      {children}
    </Web3ReactProvider>
  );
};

export function useWeb3React<
  T extends BaseProvider = Web3Provider
>(): Web3ContextType<T> {
  const context = useContext(
    Web3Context as Context<Web3ContextType<T> | undefined>
  );
  if (!context)
    throw Error(
      "useWeb3React can only be used within the Web3ReactProvider component"
    );
  return context;
}
