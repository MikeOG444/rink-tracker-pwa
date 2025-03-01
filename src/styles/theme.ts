import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1E90FF", // Bright blue for buttons & accents
    },
    secondary: {
      main: "#FF4500", // Reddish-orange for alerts
    },
    background: {
      default: "#101010", // ⚡ Slightly lighter than black for depth
      paper: "#1A1A1A", // 🎨 Dark gray for better separation
    },
    text: {
      primary: "#FFFFFF", // ✅ White text for high contrast
      secondary: "#E0E0E0", // ✅ Lighter color for better readability (was #CCCCCC)
    },
    error: {
      main: "#FF5252", // Brighter red for better visibility
    },
    success: {
      main: "#4CAF50", // Brighter green for better visibility
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#333333", // 📌 Lightened for better contrast (was #2D2D2D)
          color: "#FFFFFF",
          border: "1px solid #555555", // ✅ Slightly more visible border (was #444444)
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)", // 🖼️ Soft shadow for depth
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body2: {
          color: "#E0E0E0", // ✅ Improved contrast for timestamps & details (was #CCCCCC)
        },
        caption: {
          color: "#E0E0E0", // ✅ Improved contrast for captions
        },
        subtitle1: {
          color: "#E0E0E0", // ✅ Improved contrast for subtitles
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: "bold",
          borderRadius: "8px",
        },
        contained: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
        },
        outlined: {
          borderWidth: "2px", // Make outlined buttons more visible
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label": {
            color: "#FFFFFF",
          },
          "& label.Mui-focused": {
            color: "#1E90FF",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#BBBBBB",
            },
            "&:hover fieldset": {
              borderColor: "#1E90FF",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1E90FF",
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#FFFFFF", // Ensure icons have good contrast
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Visible hover state
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "#555555", // Improved visibility for dividers
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#FFFFFF", // Ensure dropdown icon is visible
        },
      },
    },
  },
});

export default theme;
