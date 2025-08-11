import request from 'supertest'
import app from '../app'
import { Wallet } from 'ethers'

describe('POST /verify-signature (integration)', () => {
  it('200 + payload on valid signature', async () => {
    const wallet = Wallet.createRandom()
    const message = 'hello from tests'
    const signature = await wallet.signMessage(message)

    const res = await request(app)
      .post('/verify-signature')
      .send({ message, signature, address: wallet.address })
      .expect(200)

    expect(res.body.isValid).toBe(true)
    expect(res.body.signer).toBe(wallet.address)
    expect(res.body.originalMessage).toBe(message)
  })

  it('400 on invalid signature (message altered)', async () => {
    const wallet = Wallet.createRandom()
    const signatureForA = await wallet.signMessage('A')

    // Now lie: send a DIFFERENT message but the SAME address
    await request(app)
      .post('/verify-signature')
      .send({
        message: 'B',                 // altered message
        signature: signatureForA,     // signature for 'A'
        address: wallet.address,      // claimed signer (forces compare)
      })
      .expect(400)
  })

  it('400 on missing/invalid body', async () => {
    await request(app)
      .post('/verify-signature')
      .send({ message: 123, signature: null })
      .expect(400)
  })

  it('200 when recovered address equals provided address', async () => {
    const wallet = Wallet.createRandom()
    const msg = 'hello'
    const sig = await wallet.signMessage(msg)

    const res = await request(app)
      .post('/verify-signature')
      .send({ message: msg, signature: sig, address: wallet.address })
      .expect(200)

    expect(res.body.isValid).toBe(true)
    expect(res.body.signer).toBe(wallet.address)
  })
})
