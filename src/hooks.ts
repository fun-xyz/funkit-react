// eslint-disable-next-line prettier/prettier
"use client";
import { EnvOption, Eoa, FunWallet, configureEnvironment } from "fun-wallet"
import { useCallback } from "react"
import { shallow } from "zustand/shallow"
import { connectors } from "./connectors"
import { Ethereum, Goerli, Polygon } from "./Networks"
import { createUseFun, createUseFunInterface } from "./store"
import { getActiveConnectors } from "./store/connectorStore"

export const useFun = createUseFun({
    connectors: [connectors.CoinbaseWallet(), connectors.Metamask()],
    supportedChains: [Goerli, Polygon, Ethereum],
    defaultIndex: 77
})

export const ShallowEqual = shallow

// method for getting the Functions only from the useFun Hook to prevent any updating
export const useBuildFunWallet = (build?: createUseFunInterface) => {
    if (build) console.log(build)
    const { connections, index, storedFunWallet, Authorizer, uniqueId, account, setLogin, setFunError } = useFun(
        (state) => ({
            connections: state.connectors,
            index: state.index,
            storedFunWallet: state.FunWallet,
            Authorizer: state.Eoa,
            uniqueId: state.uniqueId,
            account: state.account,
            setLogin: state.setLogin,
            setFunError: state.setFunError
        }),
        shallow
    )
    const initializeSingleAuthWallet = useCallback(
        async (config: EnvOption, index: number) => {
            const activeConnector = getActiveConnectors(connections)[0]
            if (!activeConnector || !activeConnector[0]) return
            console.log(activeConnector)

            try {
                await configureEnvironment(config)
                const ExternalOwnedAccount = new Eoa(activeConnector[0][0])
                const generatedUniqueId = await ExternalOwnedAccount.getUniqueId()
                const newFunWallet = new FunWallet({ uniqueId: generatedUniqueId, index: index })
                const newAccountAddress = await newFunWallet.getAddress()
                setLogin(config, index, newAccountAddress, newFunWallet, ExternalOwnedAccount, generatedUniqueId)
            } catch (err) {
                console.log(err)
                setFunError({ code: 1, message: "Failed to configure account", err })
            }
        },
        [connections, setFunError, setLogin]
    )

    return {
        useFun,
        connectors: connections,
        index,
        FunWallet: storedFunWallet,
        Eoa: Authorizer,
        uniqueId,
        account,
        initializeSingleAuthWallet
    }
}

// how to go from Provider to fun wallet
