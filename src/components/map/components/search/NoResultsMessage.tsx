import React from 'react';
import { Paper, Typography } from '@mui/material';

/**
 * Component to display a message when no search results are found
 */
const NoResultsMessage: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ mt: 1, p: 2 }}>
      <Typography variant="body1" align="center">
        No rinks found. Try a different search term or location.
      </Typography>
    </Paper>
  );
};

export default NoResultsMessage;
