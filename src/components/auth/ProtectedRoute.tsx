import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert, Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode; // ✅ Explicitly define the type
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState("");

  // Handle sending verification email
  const handleSendVerification = async () => {
    try {
      if (user) {
        await sendEmailVerification(user);
        setVerificationSent(true);
        setError("");
      }
    } catch (err) {
      setError("Failed to send verification email. Please try again later.");
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
        <Box sx={{ p: 4, bgcolor: "#252525", borderRadius: 2, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)" }}>
          <Typography variant="h5" color="white" gutterBottom>
            Email Verification Required
          </Typography>
          <Typography variant="body1" color="#E0E0E0" sx={{ mb: 3 }}>
            Please verify your email address before accessing the dashboard. 
            Check your inbox for a verification link.
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {verificationSent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Verification email sent! Please check your inbox.
            </Alert>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSendVerification}
              sx={{ mb: 2 }}
            >
              Resend Verification Email
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 1 }}
          >
            I've Verified My Email
          </Button>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
