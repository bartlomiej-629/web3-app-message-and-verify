import { vi } from 'vitest'

// Shape borrowed from your usage in code
export const mockUser = (overrides: Partial<any> = {}) => ({
  email: 'test@example.com',
  verifiedCredentials: [{ format: 'blockchain', address: '0xabc' }],
  ...overrides,
})

let _user: any = null

export const setMockUser = (u: any) => (_user = u)

vi.mock('@dynamic-labs/sdk-react-core', async () => {
  return {
    // Provider just renders children
    DynamicContextProvider: ({ children }: any) => children,

    // Hooks you use:
    useDynamicContext: () => ({
      user: _user,
      handleLogOut: vi.fn(),
    }),

    useConnectWithOtp: () => ({
      connectWithEmail: vi.fn().mockResolvedValue(undefined),
      verifyOneTimePassword: vi.fn().mockResolvedValue(undefined),
    }),

    useDynamicWaas: () => ({
      getWaasWallets: vi.fn(() => []), // override per test
    }),
  }
})
