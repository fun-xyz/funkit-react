import React from "react"
import type { Connector } from "@web3-react/types";
import type { Web3ReactHooks } from "@web3-react/core";
import {getName} from "fun-wallet-react";
interface ConnectorCardProps {

    connector: Connector;
    connectorHooks: Web3ReactHooks;
}

export const ConnectorCard = ({ connector, connectorHooks }:ConnectorCardProps) => {
    const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = connectorHooks

    const chainId = useChainId()
    const accounts = useAccounts()
    const isActivating = useIsActivating()
  
    const isActive = useIsActive()
  
    const provider = useProvider()
    const ENSNames = useENSNames(provider)
    return (<div className="w-[320px] b-2 p-2 flex justify-evenly">
        <div>Connector: {getName(connector)}</div>

    </div>);
}