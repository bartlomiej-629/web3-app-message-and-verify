// src/components/tests/Auth.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

// Single place to mock Dynamic
const handleLogOut = vi.fn()
const connectWithEmail = vi.fn().mockResolvedValue(undefined)
const verifyOneTimePassword = vi.fn().mockResolvedValue(undefined)
let mockUser: any = null

vi.mock('@dynamic-labs/sdk-react-core', () => ({
  DynamicContextProvider: ({ children }: any) => children,
  useDynamicContext: () => ({ user: mockUser, handleLogOut }),
  useConnectWithOtp: () => ({ connectWithEmail, verifyOneTimePassword }),
}))

import Auth from '../Auth'

test('sends OTP for email', async () => {
  render(<Auth />)
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /send otp/i }));
  expect(connectWithEmail).toHaveBeenCalledWith('test@example.com');
})

test('verifies OTP', async () => {
  render(<Auth />)
  await userEvent.type(screen.getByRole('textbox', { name: /otp/i }), '123456');
  await userEvent.click(screen.getByRole('button', { name: /verify otp/i }));
  expect(verifyOneTimePassword).toHaveBeenCalledWith('123456');
})

test('shows authenticated info when user set', async () => {
  mockUser = {
    email: 'me@site.com',
    verifiedCredentials: [{ format: 'blockchain', address: '0x999' }],
  }
  render(<Auth onLogout={handleLogOut} />)
  expect(screen.getByText(/gmail: me@site\.com/i)).toBeInTheDocument()
  expect(screen.getByText(/wallet address: 0x999/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /logout/i }))
  expect(handleLogOut).toHaveBeenCalled()
})
