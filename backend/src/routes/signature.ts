import express from 'express'
import { verifyMessage, getAddress } from 'ethers'

const router = express.Router()

router.post('/', (req, res) => {
  const { message, signature } = req.body;
  if (
    typeof message !== 'string' ||
    typeof signature !== 'string' ||
    !message || !signature) {
    return res.status(400).json({
      isValid: false,
      error: 'message, signature, and address are required strings',
    })
  }

  try {
    const signer = verifyMessage(message, signature);
    res.json({
      isValid: true,
      signer,
      originalMessage: message,
    });
  } catch (err) {
    res.status(400).json({
      isValid: false,
      error: 'Invalid signature',
    });
  }
})

export default router
