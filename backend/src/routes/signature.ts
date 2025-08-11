import express from 'express'
import { verifyMessage, getAddress } from 'ethers'

const router = express.Router()

router.post('/', (req, res) => {
  const { message, signature, address } = req.body as {
    message?: unknown; signature?: unknown; address?: unknown
  }

  if (
    typeof message !== 'string' ||
    typeof signature !== 'string' ||
    typeof address !== 'string' ||
    !message || !signature || !address
  ) {
    return res.status(400).json({
      isValid: false,
      error: 'message, signature, and address are required strings',
    })
  }

  try {
    const recovered = verifyMessage(message, signature)

    const expected = getAddress(address)
    const actual = getAddress(recovered)

    if (actual !== expected) {
      return res.status(400).json({
        isValid: false,
        error: 'Signature does not match address',
      })
    }

    return res.json({
      isValid: true,
      signer: actual,
      originalMessage: message,
    })
  } catch {
    return res.status(400).json({
      isValid: false,
      error: 'Invalid signature',
    })
  }
})

export default router
