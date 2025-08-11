import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

type HistoryItem = {
  signer: string;
  originalMessage: string;
};

type HistoryProps = {
  history: HistoryItem[];
};

const History: React.FC<HistoryProps> = ({ history }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "auto",
        mt: 4,
        px: isMobile ? 1 : 3,
      }}
    >
      <Typography variant="h5" component="h3" gutterBottom>
        Signed Message History
      </Typography>
      <List>
        {history.map((item, idx) => (
          <Paper
            key={idx}
            elevation={2}
            sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}
          >
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="bold">
                    Signer: {item.signer}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Message: {item.originalMessage}
                  </Typography>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default History;