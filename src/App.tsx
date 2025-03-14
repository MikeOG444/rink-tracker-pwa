import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; 
import theme from "./styles/theme.ts";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import MapPage from "./components/pages/MapPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PasswordResetConfirm from "./components/auth/PasswordResetConfirm";
import ActionHandler from "./components/auth/ActionHandler";
import NavBar from "./components/layout/NavBar.tsx";
import { GoogleMapsProvider } from "./context/GoogleMapsContext";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import { useEffect } from "react";
import { geolocationService } from "./services/location/GeolocationService";

const App = () => {
  // Initialize geolocation service early in the app lifecycle
  useEffect(() => {
    // Start fetching location as soon as the app loads
    console.log('App mounted, initializing geolocation service');
    geolocationService.getCurrentLocation().catch(error => {
      console.error('Error initializing geolocation service:', error);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* ✅ Applies global resets */}
      <GoogleMapsProvider>
        <Router>
          <OnboardingFlow>
            <NavBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/reset-password" element={<PasswordResetConfirm />} />
              
              {/* Handle Firebase Auth action URLs */}
              <Route path="/__/auth/action" element={<ActionHandler />} />
              <Route path="/auth/action" element={<ActionHandler />} />
            </Routes>
          </OnboardingFlow>
        </Router>
      </GoogleMapsProvider>
    </ThemeProvider>
  );
};

export default App;
