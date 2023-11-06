import { Auth, createTurnkeyPrivateKey, createTurnkeySubOrg } from '@funkit/core'
import { getWebAuthnAttestation, TurnkeyClient } from '@turnkey/http'
import { createAccount } from '@turnkey/viem'
import { WebauthnStamper } from '@turnkey/webauthn-stamper'
import React, { useState } from 'react'
import { createWalletClient, http, WalletClient } from 'viem'
import { goerli } from 'viem/chains'

import { TurnkeyAuthHookReturn } from './types'

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

export const useTurnkeyAuth = (rpId: string): TurnkeyAuthHookReturn => {
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

  /**
   * Creates a Turnkey private key object.
   * @param hasExistingPasskey True if the user wants to reuse an existing passkey, otherwise false.
   * @param subOrgId Sub Organization Id from Turnkey, either a new one or an existing one.
   * @returns Private key object with id and address. This is used by turnkey to create the private key.
   */
  const createPrivateKeyReact = async (hasExistingPasskey: boolean, subOrgId: string): Promise<any> => {
    if (!subOrgId) {
      throw new Error('sub-org id not found')
    }

    if (hasExistingPasskey) {
      const keys = await passkeyHttpClient.getPrivateKeys({ organizationId: subOrgId })
      return {
        id: keys.privateKeys[0].privateKeyId,
        address: keys.privateKeys[0].addresses[0].address,
      }
    }

    const signedRequest = await passkeyHttpClient.stampCreatePrivateKeys({
      type: 'ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2',
      organizationId: subOrgId,
      timestampMs: String(Date.now()),
      parameters: {
        privateKeys: [
          {
            // There should be only one private key per sub org. This is the name of the key, but
            // the name of the key does not matter - it is not used for anything else.
            privateKeyName: `ETH Key`,
            curve: 'CURVE_SECP256K1',
            addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
            privateKeyTags: [],
          },
        ],
      },
    })
    return await createTurnkeyPrivateKey(signedRequest)
  }

  /**
   * Creates a fun.xyz auth object, which can be used to sign messages.
   * @param subOrgId Id of the sub-org, returned from createSubOrganization
   * @param privateKey Private key object, returned from createPrivateKeyReact
   */
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

  /**
   * There are two ways to create a subOrg: with an existing passkey or with a new passkey.
   * @param hasExistingPasskey True if the user wants to reuse an existing passkey,
   * false if the user wants to create a new passkey. Each passkey corresponds to one private key.
   * @returns The subOrgId of the newly created subOrg
   */
  const createSubOrganization = async (hasExistingPasskey: boolean): Promise<string> => {
    // If the user has an existing passkey for this domain and hasExistingPasskey is true,
    // the user should be able to choose an existing passkey to login with
    if (hasExistingPasskey) {
      // This is the public org id for Fun.xyz
      const FUN_TURNKEY_ORG_ID = 'c40bb53d-ee4c-4c01-aaac-c4cca03734f8'
      const res = await passkeyHttpClient.getWhoami({
        organizationId: FUN_TURNKEY_ORG_ID,
      })
      if (res && res.organizationId) {
        // Note: This is the subOrg id, not the org id. The naming within turnkey is a bit off.
        return res.organizationId
      }
    }
    const challenge = generateRandomBuffer()
    const subOrgName = `Fun.xyz - ${humanReadableDateTime()}`
    const authenticatorUserId = generateRandomBuffer()

    // This is the name of the relaying party, in this case, it would be fun.xyz. Currently, the
    // webauthn standard does not include the name of the relaying party in the attestation, but
    // may in the future.
    const RP_NAME = 'Fun.xyz Passkeys'

    const attestation = await getWebAuthnAttestation({
      publicKey: {
        rp: {
          id: rpId,
          name: RP_NAME,
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

  /**
   * Creates a private key from a passkey via Turnkey.
   * @param hasExistingPasskey True if the user wants to reuse an existing passkey, otherwise false.
   */
  const doEverything = async (hasExistingPasskey: boolean) => {
    const newSubOrgId = await createSubOrganization(hasExistingPasskey)
    setSubOrgId(newSubOrgId)
    const newPrivateKey = await createPrivateKeyReact(hasExistingPasskey, newSubOrgId)
    setPrivateKey(newPrivateKey)
    await createAuth(newSubOrgId, newPrivateKey)
  }

  return {
    auth,
    active: subOrgId != null && privateKey != null,
    activating: false,
    authAddr: privateKey?.address,
    name: 'Turnkey',
    login: async (hasExistingPasskey: boolean) => {
      return new Promise((resolve) => {
        resolve(doEverything(hasExistingPasskey))
      })
    },
    logout: async () => {
      setAuth(undefined)
    },
  }
}
