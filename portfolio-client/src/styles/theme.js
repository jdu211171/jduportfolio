import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#5627DC', // figma violet color
        },
    },
    components: {
        MuiButton: {
            defaultProps: {
                size: 'large', // Default size for MuiTextField
            },
            styleOverrides: {
                root: {
                    height: '40px', // Set the default height here
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small', // Default size for MuiTextField
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: '#5627DC', // Background color for the active tab
                        color: '#fff', // Text color for the active tab
                    },
                },
            },
        },
    },
});

export default theme;
