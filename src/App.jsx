import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import muiTheme from './theme/muiTheme';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
