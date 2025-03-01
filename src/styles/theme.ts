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
      secondary: "#CCCCCC", // ✅ Lighter gray for readability
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#2D2D2D", // 📌 Slightly brighter than the dark background
          color: "#FFFFFF",
          border: "1px solid #444444", // ✅ Subtle border for definition
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)", // 🖼️ Soft shadow for depth
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body2: {
          color: "#CCCCCC", // ✅ Improve contrast for timestamps & details
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
  },
});

export default theme;
