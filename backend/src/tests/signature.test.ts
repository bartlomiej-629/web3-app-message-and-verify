import request from 'supertest';
import app from '../app';
import { Wallet } from 'ethers';

describe('POST /verify-signature (integration)', () => {
  let wallet: ReturnType<typeof Wallet.createRandom>;
  let message: string;
  let signature: string;

  beforeAll(async () => {
    wallet = Wallet.createRandom();
    message = 'Hello World';
    signature = await wallet.signMessage(message);
  });

  it('should return 200 and signer info for a valid signature', async () => {
    const res = await request(app)
      .post('/verify-signature')
      .send({ message, signature })
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        isValid: true,
        signer: wallet.address,
        originalMessage: message,
      })
    );
  });

  it('should return 400 if message or signature is missing', async () => {
    const res = await request(app)
      .post('/verify-signature')
      .send({})
      .expect(400);

    expect(res.body).toEqual(
      expect.objectContaining({
        isValid: false,
        error: 'message, signature, and address are required strings',
      })
    );
  });

  it('should return 400 if message is not a string', async () => {
    const res = await request(app)
      .post('/verify-signature')
      .send({ message: 12345, signature })
      .expect(400);

    expect(res.body).toEqual(
      expect.objectContaining({
        isValid: false,
        error: 'message, signature, and address are required strings',
      })
    );
  });

  it('should return 400 if signature is not a string', async () => {
    const res = await request(app)
      .post('/verify-signature')
      .send({ message, signature: 12345 })
      .expect(400);

    expect(res.body).toEqual(
      expect.objectContaining({
        isValid: false,
        error: 'message, signature, and address are required strings',
      })
    );
  });
});
