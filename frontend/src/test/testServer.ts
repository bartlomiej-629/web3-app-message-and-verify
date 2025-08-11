import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  // default handler for your backend
  http.post('http://localhost:5000/verify-signature', async ({ request }) => {
    const body = await request.json() as { message: string; signature: string }
    // return a realistic payload your UI expects
    return HttpResponse.json({
      signer: '0xABCDEF1234',
      originalMessage: body.message,
    })
  }),
]

export const server = setupServer(...handlers)
