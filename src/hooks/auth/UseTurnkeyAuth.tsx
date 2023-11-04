import { Auth, createTurnkeyPrivateKey, createTurnkeySubOrg } from '@funkit/core'
import { getWebAuthnAttestation, TurnkeyClient } from '@turnkey/http'
import { createAccount } from '@turnkey/viem'
import { WebauthnStamper } from '@turnkey/webauthn-stamper'
import React, { useState } from 'react'
import { createWalletClient, http, WalletClient } from 'viem'
import { goerli } from 'viem/chains'

import { authHookReturn } from './types'

export function refineNonNull<T>(input: T | null | undefined, errorMessage?: string): T {
  if (input == null) {
    throw new Error(errorMessage ?? `Unexpected ${JSON.stringify(input)}`)
  }

  return input
}

const generateRandomBuffer = (): ArrayBuffer => {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return arr.buffer
}

const base64UrlEncode = (challenge: ArrayBuffer): string => {
  return Buffer.from(challenge).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

type TPrivateKeyState = {
  id: string
  address: string
} | null

const humanReadableDateTime = (): string => {
  return new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '.')
}

export const useTurnkeyAuth = (rpId: string): authHookReturn => {
  // Create an auth here so we can use it to sign messages
  const [auth, setAuth] = React.useState<Auth | undefined>(undefined)
  const [subOrgId, setSubOrgId] = useState<string | null>(null)
  const [privateKey, setPrivateKey] = useState<TPrivateKeyState>(null)

  const stamper = new WebauthnStamper({
    rpId,
  })

  const passkeyHttpClient = new TurnkeyClient(
    {
      baseUrl: 'https://api.turnkey.com',
    },
    stamper
  )

  const createPrivateKeyReact = async (subOrgId: string): Promise<any> => {
    if (!subOrgId) {
      throw new Error('sub-org id not found')
    }

    const signedRequest = await passkeyHttpClient.stampCreatePrivateKeys({
      type: 'ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2',
      organizationId: subOrgId,
      timestampMs: String(Date.now()),
      parameters: {
        privateKeys: [
          {
            privateKeyName: `ETH Key ${Math.floor(Math.random() * 1_000_000_000)}`,
            curve: 'CURVE_SECP256K1',
            addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
            privateKeyTags: [],
          },
        ],
      },
    })
    return await createTurnkeyPrivateKey(signedRequest)
  }

  const createAuth = async (subOrgId: string, privateKey: any) => {
    if (!subOrgId || !privateKey) {
      throw new Error('sub-org id or private key not found')
    }

    const viemAccount = await createAccount({
      client: passkeyHttpClient,
      organizationId: subOrgId,
      privateKeyId: privateKey.id,
      ethereumAddress: privateKey.address,
    })

    const viemClient: WalletClient = createWalletClient({
      account: viemAccount,
      chain: goerli,
      transport: http(),
    }) as any as WalletClient

    const auth = new Auth({
      client: viemClient as any,
    })
    setAuth(auth)
  }

  const createSubOrganization = async (): Promise<string> => {
    // const res = await passkeyHttpClient.getWhoami({
    //   organizationId: 'c94f8969-92b8-4392-9ce7-5656653738eb',
    // })
    // if (res && res.organizationId) {
    //   return res.organizationId
    // }
    const challenge = generateRandomBuffer()
    const subOrgName = `Turnkey Viem+Passkey Demo - ${humanReadableDateTime()}`
    const authenticatorUserId = generateRandomBuffer()

    const attestation = await getWebAuthnAttestation({
      publicKey: {
        rp: {
          id: rpId,
          name: 'Fun.xyz Passkeys',
        },
        challenge,
        pubKeyCredParams: [
          {
            type: 'public-key',
            // All algorithms can be found here: https://www.iana.org/assignments/cose/cose.xhtml#algorithms
            // Turnkey only supports ES256 at the moment.
            alg: -7,
          },
        ],
        user: {
          id: authenticatorUserId,
          name: subOrgName,
          displayName: subOrgName,
        },
      },
    })

    const createSubOrgRequest = {
      subOrgName,
      attestation,
      challenge: base64UrlEncode(challenge),
    }

    return await createTurnkeySubOrg(createSubOrgRequest)
  }

  // Should create a subOrg all the way to an auth
  const doEverything = async () => {
    const newSubOrgId = await createSubOrganization()
    setSubOrgId(newSubOrgId)
    const newPrivateKey = await createPrivateKeyReact(newSubOrgId)
    setPrivateKey(newPrivateKey)
    await createAuth(newSubOrgId, newPrivateKey)
  }

  return {
    auth,
    active: subOrgId != null && privateKey != null,
    activating: false,
    authAddr: privateKey?.address,
    name: 'Turnkey',
    login: async () => {
      return new Promise((resolve) => {
        resolve(doEverything())
      })
    },
    logout: async () => {
      setAuth(undefined)
    },
  }
}
