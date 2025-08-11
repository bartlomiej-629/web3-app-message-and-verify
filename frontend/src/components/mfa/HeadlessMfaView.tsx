import { useEffect, useMemo, useRef, useState } from "react";
import {
  useDynamicContext,
  useIsLoggedIn,
  useMfa,
  useSyncMfaFlow,
} from "@dynamic-labs/sdk-react-core";
import type { MFADevice } from "@dynamic-labs/sdk-api-core";
import QRCodeUtil from "qrcode";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Security as SecurityIcon,
  QrCode2 as QrCode2Icon,
  VerifiedUser as VerifiedUserIcon,
  ContentCopy as ContentCopyIcon,
  Devices as DevicesIcon,
  Autorenew as AutorenewIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

type MfaRegisterData = {
  uri: string;
  secret: string;
};

const copyToClipboard = async (text: string, label = "Copied!") => {
  try {
    await navigator.clipboard.writeText(text);
    console.info(label);
  } catch {
    console.warn("Copy failed");
  }
};

function DevicesCard({
  devices,
  onAddDevice,
  loading,
}: {
  devices: MFADevice[];
  onAddDevice: () => void;
  loading: boolean;
}) {
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<DevicesIcon color="primary" />}
        title="MFA Devices"
        subheader="Manage authenticator devices linked to your account"
      />
      <CardContent>
        {devices.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              The following devices are registered for MFA:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "grey.100",
                overflow: "auto",
                maxHeight: 240,
                fontSize: 12,
              }}
            >
              {JSON.stringify(devices, null, 2)}
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You can add only one device.
            </Typography>
          </>
        ) : (
          <Stack spacing={2}>
            <Alert severity="info">
              No MFA device found. For stronger security, add one now.
            </Alert>
            <LoadingButton
              variant="contained"
              onClick={onAddDevice}
              loading={loading}
              startIcon={<SecurityIcon />}
            >
              Add Device
            </LoadingButton>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function QRCodeStep({
  data,
  onContinue,
  onCopySecret,
}: {
  data: MfaRegisterData;
  onContinue: () => void;
  onCopySecret: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCodeUtil.toCanvas(canvasRef.current, data.uri, (error: any) => {
      if (error) console.error(error);
    });
  }, [data.uri]);

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<QrCode2Icon color="primary" />}
        title="Scan the QR Code"
        subheader="Open your authenticator app and scan the QR code to enroll"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              If you can’t scan the QR code, enter the secret manually:
            </Typography>
            <TextField
              label="Secret"
              fullWidth
              value={data.secret}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy secret">
                      <IconButton onClick={onCopySecret} edge="end">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <Alert severity="info">
              After scanning, your authenticator app will generate 6-digit
              codes. Click Continue to verify one.
            </Alert>
            <Button variant="contained" onClick={onContinue}>
              Continue
            </Button>
          </Stack>
        </Grid>
      </CardContent>
    </Card>
  );
}

function OTPForm({
  onSubmit,
  loading,
}: {
  onSubmit: (code: string) => Promise<void> | void;
  loading: boolean;
}) {
  const [otp, setOtp] = useState("");
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    const trimmed = otp.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setLocalErr("Please enter a valid 6-digit code.");
      return;
    }
    await onSubmit(trimmed);
  };

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<VerifiedUserIcon color="primary" />}
        title="Verify OTP"
        subheader="Enter the 6-digit code from your authenticator app"
      />
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="One-Time Password"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            helperText={localErr ?? "Code refreshes every ~30 seconds"}
            error={Boolean(localErr)}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            fullWidth
          >
            Submit
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BackupCodesCard({
  codes,
  onAccept,
  onCopyAll,
}: {
  codes: string[];
  onAccept: () => void;
  onCopyAll: () => void;
}) {
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<SecurityIcon color="primary" />}
        title="Backup Codes"
        subheader="Save these codes in a secure place. Each code can be used once."
      />
      <CardContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Treat backup codes like passwords. Store them offline and never share.
        </Alert>
        <List dense sx={{ bgcolor: "grey.50", borderRadius: 1 }}>
          {codes.map((code) => (
            <ListItem
              key={code}
              secondaryAction={
                <Tooltip title="Copy code">
                  <IconButton edge="end" onClick={() => copyToClipboard(code)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemIcon>
                <VerifiedUserIcon color="action" />
              </ListItemIcon>
              <ListItemText primary={<code>{code}</code>} />
            </ListItem>
          ))}
        </List>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onCopyAll} startIcon={<ContentCopyIcon />}>
            Copy All
          </Button>
          <Button variant="contained" onClick={onAccept}>
            I’ve Saved These Codes
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

const steps = ["Devices", "Scan QR", "Verify OTP", "Backup Codes"] as const;
type StepKey = "devices" | "qr-code" | "otp" | "backup-codes";

const stepIndexMap: Record<StepKey, number> = {
  "devices": 0,
  "qr-code": 1,
  "otp": 2,
  "backup-codes": 3,
};

const HeadlessMfaView = () => {
  const [userDevices, setUserDevices] = useState<MFADevice[]>([]);
  const [mfaRegisterData, setMfaRegisterData] = useState<MfaRegisterData>();
  const [currentView, setCurrentView] = useState<StepKey>("devices");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const isLogged = useIsLoggedIn();
  const {
    addDevice,
    authenticateDevice,
    getUserDevices,
    getRecoveryCodes,
    completeAcknowledgement,
  } = useMfa();

  const { userWithMissingInfo, user } = useDynamicContext();

  const refreshUserDevices = async () => {
    const devices = await getUserDevices();
    setUserDevices(devices);
  };

  useEffect(() => {
    if (isLogged) {
      refreshUserDevices();
    }
  }, [isLogged]);

  useSyncMfaFlow({
    handler: async () => {
      if (userWithMissingInfo?.scope?.includes("requiresAdditionalAuth")) {
        const devices = await getUserDevices();
        if (devices.length === 0) {
          setError(undefined);
          const { uri, secret } = await addDevice();
          setMfaRegisterData({ secret, uri });
          setCurrentView("qr-code");
        } else {
          setError(undefined);
          setMfaRegisterData(undefined);
          setCurrentView("otp");
        }
      } else {
        const codes = await getRecoveryCodes();
        setBackupCodes(codes);
        setCurrentView("backup-codes");
      }
    },
  });

  const onAddDevice = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const { uri, secret } = await addDevice();
      setMfaRegisterData({ secret, uri });
      setCurrentView("qr-code");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  const onQRCodeContinue = async () => {
    setError(undefined);
    setMfaRegisterData(undefined);
    setCurrentView("otp");
  };

  const onOtpSubmit = async (code: string) => {
    try {
      setLoading(true);
      setError(undefined);
      await authenticateDevice({ code });
      const codes = await getRecoveryCodes();
      setBackupCodes(codes);
      setCurrentView("backup-codes");
      await refreshUserDevices();
    } catch (e: any) {
      setError(e?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGenerateRecoveryCodes = async () => {
    try {
      setLoading(true);
      const codes = await getRecoveryCodes(true);
      setBackupCodes(codes);
      setCurrentView("backup-codes");
    } catch (e: any) {
      setError(e?.message ?? "Could not generate recovery codes.");
    } finally {
      setLoading(false);
    }
  };

  const onCopyAllCodes = async () => {
    if (!backupCodes.length) return;
    await copyToClipboard(backupCodes.join("\n"), "All backup codes copied!");
  };

  const activeStep = useMemo(() => stepIndexMap[currentView], [currentView]);

  if (!user && !userWithMissingInfo) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Protect your account by adding an authenticator app and saving backup codes.
        </Typography>
      </Stack>

      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {currentView === "devices" && (
          <DevicesCard
            devices={userDevices}
            onAddDevice={onAddDevice}
            loading={loading}
          />
        )}
        {currentView === "qr-code" && mfaRegisterData && (
          <QRCodeStep
            data={mfaRegisterData}
            onContinue={onQRCodeContinue}
            onCopySecret={() => copyToClipboard(mfaRegisterData.secret)}
          />
        )}
        {currentView === "otp" && (
          <OTPForm onSubmit={onOtpSubmit} loading={loading} />
        )}
        {currentView === "backup-codes" && (
          <BackupCodesCard
            codes={backupCodes}
            onAccept={completeAcknowledgement}
            onCopyAll={onCopyAllCodes}
          />
        )}
        <Card variant="outlined">
          <CardHeader
            title="Actions"
            subheader="Utility actions for managing MFA"
          />
          <CardContent>
            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<AutorenewIcon />}
                onClick={onGenerateRecoveryCodes}
                disabled={loading}
              >
                Generate Recovery Codes
              </Button>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Tip: You can add multiple devices for redundancy (e.g., phone
                and tablet). Keep backup codes offline in a safe place.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
};

export default HeadlessMfaView;
