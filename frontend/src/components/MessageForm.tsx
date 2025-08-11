import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { verifySignature } from '../services/api';

const MessageForm = ({ onResult }: any) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getWaasWallets } = useDynamicWaas();

const handleSign = async () => {
  setError(null);
  setLoading(true);
  const waasWallets = getWaasWallets();
  const embeddedWallet = waasWallets?.[0];

  if (!embeddedWallet) {
    setError('No embedded wallet found.');
    setLoading(false);
    return;
  }

  try {
    const signature = await embeddedWallet.signMessage(message);
    if (!signature) {
      setError('Failed to sign the message.');
      setLoading(false);
      return;
    }
    const result = await verifySignature(message, signature);
    onResult(result);
    setMessage(''); // Clear message after success
  } catch (err) {
    setError('Error verifying signature.');
    console.error('Error verifying signature:', err);
  } finally {
    setLoading(false);
  }
};
  
  return (
    <Box
      component="form"
      sx={{
        maxWidth: '100%',
        mx: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h6" align="center">
        Sign and Verify Message
      </Typography>
      <TextField
        label="Message"
        multiline
        minRows={3}
        value={message}
        onChange={e => setMessage(e.target.value)}
        variant="outlined"
        fullWidth
        required
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSign}
        disabled={loading || !message.trim()}
        fullWidth
        size="large"
      >
        {loading ? <CircularProgress size={24} /> : 'Sign and Verify'}
      </Button>
    </Box>
  );
};

export default MessageForm;