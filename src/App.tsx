import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; 
import theme from "./styles/theme.ts";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PasswordResetConfirm from "./components/auth/PasswordResetConfirm";
import NavBar from "./components/layout/NavBar.tsx";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* ✅ Applies global resets */}
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/reset-password" element={<PasswordResetConfirm />} />
          {/* Handle Firebase Auth action URLs */}
          <Route path="/__/auth/action" element={<PasswordResetConfirm />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
