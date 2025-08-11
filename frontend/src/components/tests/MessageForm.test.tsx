// src/components/tests/MessageForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Base mocks for the Dynamic SDK
vi.mock('@dynamic-labs/sdk-react-core', () => ({
  DynamicContextProvider: ({ children }: any) => children,
  useDynamicContext: () => ({ user: null, handleLogOut: vi.fn() }),
  useConnectWithOtp: () => ({
    connectWithEmail: vi.fn(),
    verifyOneTimePassword: vi.fn(),
  }),
  // Default: return a wallet; override in the "no wallet" test
  useDynamicWaas: () => ({
    getWaasWallets: () => [{
      signMessage: vi.fn(async (m: string) => `0xSIG(${m})`)
    }],
  }),
}))

// IMPORTANT: import after the vi.mock above
import MessageForm from '../MessageForm'

test('shows error when no embedded wallet', async () => {
  // Override only for this test
  const mod = await vi.importMock<any>('@dynamic-labs/sdk-react-core')
  mod.useDynamicWaas = () => ({ getWaasWallets: () => [] })

  // Re-import component so it picks up the override
  vi.resetModules()
  const { default: MessageFormLocal } = await import('../MessageForm')

  render(<MessageFormLocal onResult={vi.fn()} />)

  await userEvent.type(screen.getByLabelText(/message/i), 'msg')   // <-- enable button
  await userEvent.click(screen.getByRole('button', { name: /sign and verify/i }))

  expect(await screen.findByText(/no embedded wallet found/i)).toBeInTheDocument()
})
