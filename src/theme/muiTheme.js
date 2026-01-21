import { createTheme, responsiveFontSizes } from '@mui/material/styles';


let muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0b6b5f', // deep teal for a professional look
      contrastText: '#fff',
    },
    secondary: {
      main: '#1976d2',
    },
    success: {
      main: '#2e7d32',
    },
    info: {
      main: '#0288d1',
    },
    background: {
      default: '#f5f7f9', // subtle light background
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#546e7a',
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2.25rem', fontWeight: 900 },
    h2: { fontSize: '1.75rem', fontWeight: 900 },
    h3: { fontSize: '1.25rem', fontWeight: 900 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'linear-gradient(90deg, rgba(11,107,95,1) 0%, rgba(25,118,210,1) 100%)' , boxShadow: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: '0 6px 20px rgba(16,24,40,0.06)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: { boxShadow: 'none' },
        root: { borderRadius: 10 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid rgba(16,24,40,0.04)' },
      },
    },
  },
});

muiTheme = responsiveFontSizes(muiTheme);

export default muiTheme;
