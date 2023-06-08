// eslint-disable-next-line prettier/prettier
"use client";
import { useCallback } from "react"
import { shallow } from "zustand/shallow"
import { connectors } from "./connectors"
import { Ethereum, Goerli, Polygon } from "./Networks"
import { createUseFun, createUseFunInterface } from "./store"


export const useFun = createUseFun({
    connectors: [connectors.CoinbaseWallet(), connectors.Metamask()],
    supportedChains: [Goerli, Polygon, Ethereum],
    defaultIndex: 77
})

export const ShallowEqual = shallow

export const useBuildFunWallet = (build: createUseFunInterface) => {

    const { connections, index, FunWallet, Eoa, uniqueId, account } = useFun(
        (state) => ({
            connections: state.connectors,
            index: state.index,
            FunWallet: state.FunWallet,
            Eoa: state.Authorizer,
            uniqueId: state.uniqueId,
            account: state.account
        }),
        shallow
    )
    const initializeSingleAuthWallet = useCallback(() => {}, [])

    return { useFun }
}


// how to go from Provider to fun walletqaaaaaa

