import { createTheme } from "@mui/material/styles";

const GLASS_BORDER = "rgba(255, 255, 255, 0.09)";
const GLASS_FILL = "rgba(255, 255, 255, 0.045)";
const GLASS_SHADOW = "0 20px 50px -30px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.07)";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0fd8d7",
      contrastText: "#04201f",
    },
    secondary: {
      main: "#9f7aea",
      contrastText: "#0c0a14",
    },
    background: {
      default: "#030304",
      paper: GLASS_FILL,
    },
    divider: GLASS_BORDER,
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#030304",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: GLASS_FILL,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${GLASS_BORDER}`,
          boxShadow: GLASS_SHADOW,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: GLASS_FILL,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(2, 3, 6, 0.6)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: "0 0 24px rgba(15, 216, 215, 0.25)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.06)",
          border: `1px solid ${GLASS_BORDER}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        },
        notchedOutline: {
          borderColor: "rgba(255, 255, 255, 0.14)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255, 255, 255, 0.07)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "rgba(15, 216, 215, 0.14)",
            boxShadow: "inset 0 0 0 1px rgba(15, 216, 215, 0.28)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(15, 216, 215, 0.18)",
          },
        },
      },
    },
  },
});

export default theme;
