import { ApiKeyStamper } from '@turnkey/api-key-stamper'
import { createActivityPoller, TSignedRequest, TurnkeyClient } from '@turnkey/http'
import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { refineNonNull } from './utils'

type TResponse = {
  message: string
  address?: string
  privateKeyId?: string
}

export default async function createKey(req: NextApiRequest, res: NextApiResponse<TResponse>) {
  const signedRequest = req.body as TSignedRequest

  try {
    const activityResponse = await axios.post(signedRequest.url, signedRequest.body, {
      headers: {
        [signedRequest.stamp.stampHeaderName]: signedRequest.stamp.stampHeaderValue,
      },
    })

    if (activityResponse.status !== 200) {
      res.status(500).json({
        message: `expected 200, got ${activityResponse.status}`,
      })
    }

    const stamper = new ApiKeyStamper({
      apiPublicKey: process.env.API_PUBLIC_KEY!,
      apiPrivateKey: process.env.API_PRIVATE_KEY!,
    })
    const client = new TurnkeyClient({ baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL! }, stamper)

    const activityPoller = createActivityPoller({
      client,
      requestFn: client.getActivity,
    })

    const activityId = refineNonNull(activityResponse.data.activity?.id)
    const subOrgId = refineNonNull(activityResponse.data.activity?.organizationId)

    const completedActivity = await activityPoller({
      activityId,
      organizationId: subOrgId,
    })

    const privateKeys = completedActivity.result.createPrivateKeysResultV2?.privateKeys

    // XXX: sorry for the ugly code! We expect a single key / address returned.
    // If we have more than one key / address returned, or none, this would break.
    const address = privateKeys?.map((pk) => pk.addresses?.map((addr) => addr.address).join('')).join('')
    const privateKeyId = privateKeys?.map((pk) => pk.privateKeyId).join('')

    res.status(200).json({
      message: 'successfully created key',
      address,
      privateKeyId,
    })
  } catch (e) {
    console.error(e)

    res.status(500).json({
      message: `Something went wrong, caught error: ${e}`,
    })
  }
}
