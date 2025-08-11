import { render, screen } from '@testing-library/react'
import History from '../History'

test('renders signed items', () => {
  const items = [
    { signer: '0x1', originalMessage: 'A' },
    { signer: '0x2', originalMessage: 'B' },
  ]
  render(<History history={items} />)
  expect(screen.getByText(/signer: 0x1/i)).toBeInTheDocument()
  expect(screen.getByText(/message: a/i)).toBeInTheDocument()
  expect(screen.getByText(/signer: 0x2/i)).toBeInTheDocument()
})
