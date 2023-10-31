import { Auth } from '@funkit/core'
import { ApiKeyStamper } from '@turnkey/api-key-stamper'
import { createActivityPoller, getWebAuthnAttestation, TurnkeyClient } from '@turnkey/http'
import { createAccount } from '@turnkey/viem'
import { WebauthnStamper } from '@turnkey/webauthn-stamper'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { createWalletClient, http, WalletClient } from 'viem'

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

  const createPrivateKey = async (subOrgId: string): Promise<any> => {
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
    console.log('signedRequest', signedRequest)

    const activityResponse = await axios.post(signedRequest.url, signedRequest.body, {
      headers: {
        [signedRequest.stamp.stampHeaderName]: signedRequest.stamp.stampHeaderValue,
      },
    })

    if (activityResponse.status !== 200) {
      throw new Error('Failed to get response')
    }

    const stamper = new ApiKeyStamper({
      apiPublicKey: '0306bbf329c279010ddc2ad278cb05f64b9bb53cd869f5bce3b3e93d440b26166a',
      apiPrivateKey: '43547e88f7a8b10adf81bf02071f4cfa89bfa5ad6c773f006301d8ee3a40ceb9',
    })
    const client = new TurnkeyClient({ baseUrl: 'https://api.turnkey.com' }, stamper)

    const activityPoller = createActivityPoller({
      client,
      requestFn: client.getActivity,
    })

    const activityId = refineNonNull(activityResponse.data.activity?.id)
    const newSubOrgId = refineNonNull(activityResponse.data.activity?.organizationId)

    const completedActivity = await activityPoller({
      activityId,
      organizationId: newSubOrgId,
    })

    const privateKeys = completedActivity.result.createPrivateKeysResultV2?.privateKeys

    // XXX: sorry for the ugly code! We expect a single key / address returned.
    // If we have more than one key / address returned, or none, this would break.
    const address = privateKeys?.map((pk) => pk.addresses?.map((addr) => addr.address).join('')).join('')
    const privateKeyId = privateKeys?.map((pk) => pk.privateKeyId).join('')

    setPrivateKey({
      id: privateKeyId!,
      address: address!,
    })
    return {
      id: privateKeyId!,
      address: address!,
    }
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
      transport: http(),
    }) as any as WalletClient

    const auth = new Auth({
      client: viemClient as any,
    })
    setAuth(auth)
  }

  const createSubOrg = async (): Promise<string> => {
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
    console.log('Create sub org request', createSubOrgRequest)
    const turnkeyClient = new TurnkeyClient(
      { baseUrl: 'https://api.turnkey.com' },
      new ApiKeyStamper({
        apiPublicKey: '0306bbf329c279010ddc2ad278cb05f64b9bb53cd869f5bce3b3e93d440b26166a',
        apiPrivateKey: '43547e88f7a8b10adf81bf02071f4cfa89bfa5ad6c773f006301d8ee3a40ceb9',
      })
    )

    const activityPoller = createActivityPoller({
      client: turnkeyClient,
      requestFn: turnkeyClient.createSubOrganization,
    })

    const privateKeyName = `Default ETH Key`

    const completedActivity = await activityPoller({
      type: 'ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V3',
      timestampMs: String(Date.now()),
      organizationId: 'c94f8969-92b8-4392-9ce7-5656653738eb',
      parameters: {
        subOrganizationName: createSubOrgRequest.subOrgName,
        rootQuorumThreshold: 1,
        rootUsers: [
          {
            userName: 'New user',
            apiKeys: [],
            authenticators: [
              {
                authenticatorName: 'Passkey',
                challenge: createSubOrgRequest.challenge,
                attestation: createSubOrgRequest.attestation,
              },
            ],
          },
        ],
        privateKeys: [
          {
            privateKeyName,
            curve: 'CURVE_SECP256K1',
            addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
            privateKeyTags: [],
          },
        ],
      },
    })

    const newSubOrgId = refineNonNull(completedActivity.result.createSubOrganizationResultV3?.subOrganizationId)
    setSubOrgId(newSubOrgId)
    return newSubOrgId
  }

  // Should create a subOrg all the way to an auth
  const doEverything = async () => {
    console.log('Creating Sub Org')
    const newSubOrgId = await createSubOrg()
    console.log('Creating Private Key')
    const newPrivateKey = await createPrivateKey(newSubOrgId)
    console.log('Creating Auth')
    await createAuth(newSubOrgId, newPrivateKey)
    console.log('Created auth', await auth?.getAddress())
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
