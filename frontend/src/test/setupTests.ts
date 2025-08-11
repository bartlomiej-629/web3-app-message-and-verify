import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './testServer'

// Polyfill fetch for MSW/axios if needed
import 'whatwg-fetch'

// Start MSW (node) for unit/integration tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Clean localStorage between tests
afterEach(() => {
  localStorage.clear()
})
