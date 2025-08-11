import {
  DynamicContextProvider,
  useDynamicWaas,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { useEffect } from "react";
import { Box } from "@mui/material";

function WaaSLogger() {
  const { getWaasWallets } = useDynamicWaas();

  useEffect(() => {
    const waasWallets = getWaasWallets();
    if (waasWallets) {
      console.log('User has an embedded wallet:', waasWallets);
    } else {
      console.log('User does not have an embedded wallet. Create one now!');
    }
  }, [getWaasWallets]);

  return null;
}

export const WalletProvider = ({ children }: any) => (
  <DynamicContextProvider
    settings={{
      environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
      walletConnectors: [EthereumWalletConnectors],
    }}
  >
    <Box
      minHeight="100vh"
      flexDirection="column"
    >
      <WaaSLogger />
      {children}
    </Box>
  </DynamicContextProvider>
);