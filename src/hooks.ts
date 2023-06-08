// eslint-disable-next-line prettier/prettier
"use client";
import { shallow } from "zustand/shallow"
import { connectors } from "./connectors"
import { Ethereum, Goerli, Polygon } from "./Networks"
import { createUseFun } from "./store"

export const useFun = createUseFun({
    connectors: [connectors.CoinbaseWallet(), connectors.Metamask()],
    supportedChains: [Goerli, Polygon, Ethereum],
    defaultIndex: 77
})

export const ShallowEqual = shallow
