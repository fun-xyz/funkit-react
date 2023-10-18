import { Auth } from '@funkit/core'
import { getWebAuthnAttestation, TurnkeyClient } from '@turnkey/http'
import { createAccount } from '@turnkey/viem'
import { WebauthnStamper } from '@turnkey/webauthn-stamper'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'

import { authHookReturn } from './types'

type subOrgFormData = {
  subOrgName: string
}

type privateKeyFormData = {
  privateKeyName: string
}

type signingFormData = {
  messageToSign: string
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

type TSignedMessage = {
  message: string
  signature: string
} | null

const humanReadableDateTime = (): string => {
  return new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '.')
}

export const usePrivyAuth = (readonly = false): authHookReturn => {
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

  const createPrivateKey = async () => {
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

    const response = await axios.post('/api/createKey', signedRequest)

    setPrivateKey({
      id: response.data['privateKeyId'],
      address: response.data['address'],
    })
  }

  const signMessage = async (data: signingFormData) => {
    if (!subOrgId || !privateKey) {
      throw new Error('sub-org id or private key not found')
    }

    const viemAccount = await createAccount({
      client: passkeyHttpClient,
      organizationId: subOrgId,
      privateKeyId: privateKey.id,
      ethereumAddress: privateKey.address,
    })

    const viemClient = createWalletClient({
      account: viemAccount,
      chain: sepolia,
      transport: http(),
    })
  }

  const createSubOrg = async () => {
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

    const res = await axios.post('/api/createSubOrg', {
      subOrgName,
      attestation,
      challenge: base64UrlEncode(challenge),
    })

    setSubOrgId(res.data.subOrgId)
  }

  // Should create a subOrg all the way to an auth
  const doEverything = async () => {
    console.log('Reached doEverything')
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
