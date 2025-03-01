import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../firebase";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress
} from "@mui/material";

const PasswordResetConfirm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the action code from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("oobCode");
    if (code) {
      setOobCode(code);
    } else {
      setError("Invalid password reset link. Please request a new one.");
    }
  }, [location]);

  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!oobCode) {
      setError("Invalid password reset code. Please request a new reset link.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Confirm the password reset with Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setLoading(false);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err: any) {
      setLoading(false);
      console.error("Password reset error:", err);
      
      if (err.code === "auth/expired-action-code") {
        setError("The password reset link has expired. Please request a new one.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Invalid password reset link. Please request a new one.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ 
      textAlign: "center", 
      mt: 5, 
      bgcolor: "#252525", 
      p: 4, 
      borderRadius: 2,
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)"
    }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: "white", mb: 3 }}>
        Reset Your Password
      </Typography>
      
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your password has been successfully reset!
          </Alert>
          <Typography color="white" variant="body1">
            Redirecting you to the login page...
          </Typography>
        </Box>
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Typography color="#E0E0E0" variant="body1" sx={{ mb: 3 }}>
            Please enter your new password below.
          </Typography>
          
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ 
              mb: 2, 
              bgcolor: "white", 
              borderRadius: 1,
              '& .MuiInputBase-input': {
                color: '#000000',
              },
              '& .MuiInputLabel-root': {
                color: '#757575',
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 5px',
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ 
              mb: 3, 
              bgcolor: "white", 
              borderRadius: 1,
              '& .MuiInputBase-input': {
                color: '#000000',
              },
              '& .MuiInputLabel-root': {
                color: '#757575',
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 5px',
              }
            }}
          />
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/auth")}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </>
      )}
    </Container>
  );
};

export default PasswordResetConfirm;
