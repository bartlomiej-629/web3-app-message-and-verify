import type { FormEventHandler } from 'react';
import { useConnectWithOtp, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
} from '@mui/material';
import { FaRocket } from 'react-icons/fa';

const Auth = ({ onLogout }: { onLogout?: () => void }) => {
  const { user, handleLogOut } = useDynamicContext();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();

  const gmail = user?.email;
  const walletCredential = user?.verifiedCredentials?.find(
    (cred: any) => cred.format === "blockchain" && !!cred.address
  );
  const walletAddress = walletCredential?.address ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (event) => {
  //   event.preventDefault();
  //   setError(null);
  //   setLoading(true);
  //   const email = event.currentTarget.email.value;
  //   try {
  //     await connectWithEmail(email);
  //   } catch (err: any) {
  //     setError(err?.message || "Failed to send OTP.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (event) => {
  //   event.preventDefault();
  //   setError(null);
  //   setLoading(true);
  //   const otp = event.currentTarget.otp.value;
  //   try {
  //     await verifyOneTimePassword(otp);
  //   } catch (err: any) {
  //     setError(err?.message || "Invalid OTP.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get('email') || '');
      await connectWithEmail(email);
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const otp = String(formData.get('otp') || '');
      await verifyOneTimePassword(otp);
    } catch (err: any) {
      setError(err?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      handleLogOut();
      onLogout();
    }
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      marginY={4}
    >
      <Box mb={4} display="flex" alignItems="center" gap={1}>
        <FaRocket size={32} color="#1976d2" />
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Montserrat', 'Roboto', 'Arial', sans-serif",
            fontWeight: 700,
            letterSpacing: 2,
            color: "#1976d2",
            textShadow: "1px 2px 8px #b3c6e7",
          }}
        >
          MyApp
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, minWidth: 320, width: '100%' }}>
        <Stack spacing={3}>
          <Typography variant="h5" align="center">
            Sign In
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={onSubmitEmailHandler}>
            <Stack spacing={2}>
              <TextField
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                fullWidth
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </Stack>
          </form>

          <form onSubmit={onSubmitOtpHandler}>
            <Stack spacing={2}>
              <TextField
                type="text"
                name="otp"
                label="OTP"
                placeholder="Enter OTP"
                fullWidth
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loading}
                fullWidth
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </Stack>
          </form>

          {!!user && (
            <Box>
              <Typography variant="subtitle1">Authenticated user:</Typography>
              {gmail && <Typography>Gmail: {gmail}</Typography>}
              {walletAddress && <Typography>Wallet Address: {walletAddress}</Typography>}
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Auth;