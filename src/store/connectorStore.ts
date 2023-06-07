import type { Web3ReactHooks } from "@web3-react/core";
import type { Connector, Web3ReactStore } from "@web3-react/types";

export interface ConnectorStoreInterface {
  connectors:
    | [Connector, Web3ReactHooks][]
    | [Connector, Web3ReactHooks, Web3ReactStore][];
  groupId: string | null;
  setGroupId: (groupId: string) => void;
  requiredActiveConnectors: number;
  setRequiredActiveConnectors: (requiredActiveConnectors: number) => void;
  activeConnectors: number;
  addActiveConnectors: () => void;
  removeActiveConnectors: () => void;
  resetActiveConnectors: () => void;
}

// should we automatically build an Eoa for each connetor?

export const initializeConnectors = (
  connectorFunctions: (() => [Connector, Web3ReactHooks, Web3ReactStore])[]
) => {
  const connectors = connectorFunctions.map((connectorFunction) =>
    connectorFunction()
  );
  return connectors;
};

