import { Auth, createPrivateKey, createSubOrg } from '@funkit/core'
import { getWebAuthnAttestation, TurnkeyClient } from '@turnkey/http'
import { createAccount } from '@turnkey/viem'
import { WebauthnStamper } from '@turnkey/webauthn-stamper'
import React, { useEffect, useState } from 'react'
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

export const useTurnkeyAuth = (readonly = false): authHookReturn => {
  // Create an auth here so we can use it to sign messages
  const [auth, setAuth] = React.useState<Auth | undefined>(undefined)
  const [subOrgId, setSubOrgId] = useState<string | null>(null)
  const [privateKey, setPrivateKey] = useState<TPrivateKeyState>(null)

  const stamper = new WebauthnStamper({
    rpId: 'localhost',
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
            privateKeyName: `ETH Key ${Math.floor(Math.random() * 1000)}`,
            curve: 'CURVE_SECP256K1',
            addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
            privateKeyTags: [],
          },
        ],
      },
    })
    return await createPrivateKey(signedRequest)
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
    const challenge = generateRandomBuffer()
    const subOrgName = `Turnkey Viem+Passkey Demo - ${humanReadableDateTime()}`
    const authenticatorUserId = generateRandomBuffer()

    const attestation = await getWebAuthnAttestation({
      publicKey: {
        rp: {
          id: 'localhost',
          name: 'Turnkey Viem Passkey Demo',
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

    return await createSubOrg(createSubOrgRequest)
  }

  // Should create a subOrg all the way to an auth
  const doEverything = async () => {
    const newSubOrgId = await createSubOrganization()
    const newPrivateKey = await createPrivateKeyReact(newSubOrgId)
    await createAuth(newSubOrgId, newPrivateKey)
  }

  useEffect(() => {
    // Create a new auth here like new Auth({...}) and call setAuth(auth)
  }, [])

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
      console.log('logout, you still need to implement this albert')
    },
  }
}
