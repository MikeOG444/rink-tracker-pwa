import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth, googleProvider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
  Alert,
  Divider,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  // ✅ Redirect user to dashboard if already signed in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Check if the user is returning from a password reset
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const mode = queryParams.get('mode');
    
    if (mode === 'resetPassword') {
      setSuccessMessage("Your password has been reset successfully. You can now log in with your new password.");
      
      // Clear the URL parameters to avoid showing the message again on refresh
      window.history.replaceState({}, document.title, "/auth");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox for a verification link.");
        // Send another verification email if needed
        await sendEmailVerification(userCredential.user);
        setSuccessMessage("A new verification email has been sent to your inbox.");
        // Sign out the user since they're not verified
        await auth.signOut();
        return;
      }
      
      navigate("/dashboard"); // ✅ Redirect after login
    } catch (err: any) {
      setError("Incorrect email or password. Please try again.");
    }
  };

  const handleSignup = async () => {
    if (!fullName.trim()) {
      setError("Full name is required for sign up.");
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user profile with the full name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      setSuccessMessage("Account created! Please check your email to verify your account before logging in.");
      setIsSignUp(false); // Return to login screen
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err: any) {
      setError("Error creating account. Ensure email is valid and password is at least 6 characters.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Google sign-in automatically includes the user's name in the profile
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address to reset your password.");
      return;
    }

    try {
      // Send password reset email with the continueUrl set to /auth
      // Firebase will handle the reset on its page, then redirect to our login page
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/auth"
      });
      setSuccessMessage("Password reset email sent! Check your inbox.");
      setError("");
      setIsResetPassword(false);
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      // Check for specific Firebase error codes
      if (err.code === "auth/user-not-found") {
        setError("No account exists with this email address. Please sign up or check if the email was entered correctly.");
      } else {
        setError("Failed to send password reset email. Please check if the email is correct.");
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ 
      textAlign: "center", 
      mt: 5, 
      bgcolor: "#252525", // Slightly lighter background for better contrast
      p: 4, 
      borderRadius: 2,
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)" // Add shadow for depth
    }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: "white", mb: 3 }}>
        Welcome to Rink Tracker
      </Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
      
      {isResetPassword ? (
        <>
          <Typography variant="h6" color="white" sx={{ mb: 2 }}>
            Reset Your Password
          </Typography>
          <Typography variant="body2" color="#E0E0E0" sx={{ mb: 2 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            fullWidth
            label="Email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ 
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
            InputProps={{
              style: { color: '#000000' },
              placeholder: 'Enter your email address'
            }}
          />
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            onClick={handleResetPassword} 
            sx={{ mt: 3 }}
          >
            Send Reset Link
          </Button>
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary" 
            onClick={() => {
              setIsResetPassword(false);
              setError("");
              setSuccessMessage("");
            }} 
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </>
      ) : isSignUp && (
        <TextField
          fullWidth
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{ 
            mt: 3, 
            bgcolor: "white", 
            borderRadius: 1,
            '& .MuiInputBase-input': {
              color: '#000000', // Black text for high contrast
            },
            '& .MuiInputLabel-root': {
              color: '#757575', // Grey label text
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)', // Adjust label position when shrunk
              backgroundColor: 'white',
              padding: '0 5px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#BBBBBB', // Lighter border color
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1E90FF', // Blue border when focused
            }
          }}
          InputProps={{
            style: { color: '#000000' }, // Ensure text is black
            placeholder: 'Enter your full name'
          }}
          required
        />
      )}
      <TextField
        fullWidth
        label="Email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ 
          mt: isSignUp ? 2 : 3, 
          bgcolor: "white", 
          borderRadius: 1,
          '& .MuiInputBase-input': {
            color: '#000000', // Black text for high contrast
          },
          '& .MuiInputLabel-root': {
            color: '#757575', // Grey label text
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)', // Adjust label position when shrunk
            backgroundColor: 'white',
            padding: '0 5px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BBBBBB', // Lighter border color
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1E90FF', // Blue border when focused
          }
        }}
        InputProps={{
          style: { color: '#000000' }, // Ensure text is black
          placeholder: 'Enter your email address'
        }}
      />
      <TextField
        fullWidth
        label="Password"
        placeholder="Enter your password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ 
          mt: 2, 
          bgcolor: "white", 
          borderRadius: 1,
          '& .MuiInputBase-input': {
            color: '#000000', // Black text for high contrast
          },
          '& .MuiInputLabel-root': {
            color: '#757575', // Grey label text
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)', // Adjust label position when shrunk
            backgroundColor: 'white',
            padding: '0 5px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BBBBBB', // Lighter border color
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1E90FF', // Blue border when focused
          }
        }}
        InputProps={{
          style: { color: '#000000' }, // Ensure text is black
          placeholder: 'Enter your password'
        }}
      />
      {isSignUp ? (
        <>
          <Button fullWidth variant="contained" color="primary" onClick={handleSignup} sx={{ mt: 3 }}>
            Sign Up
          </Button>
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary" 
            onClick={() => {
              setIsSignUp(false);
              setError("");
            }} 
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </>
      ) : !isResetPassword && (
        <>
          <Button fullWidth variant="contained" color="primary" onClick={handleLogin} sx={{ mt: 3 }}>
            Login
          </Button>
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary" 
            onClick={() => {
              setIsSignUp(true);
              setError("");
            }} 
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
          <Typography 
            variant="body2" 
            color="#1E90FF" 
            sx={{ 
              mt: 1, 
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline"
              }
            }}
            onClick={() => {
              setIsResetPassword(true);
              setError("");
              setSuccessMessage("");
            }}
          >
            Forgot Password?
          </Typography>
        </>
      )}

      <Divider sx={{ my: 3, bgcolor: "#777777" }}>
        <Typography color="white" fontWeight="bold">OR</Typography>
      </Divider>

      <Button
        fullWidth
        variant="contained"
        startIcon={<GoogleIcon />}
        sx={{ 
          bgcolor: "white", 
          color: "black",
          '&:hover': {
            bgcolor: "#e0e0e0", // Slightly darker on hover for feedback
          }
        }}
        onClick={handleGoogleSignIn}
      >
        Sign in with Google
      </Button>
    </Container>
  );
};

export default AuthPage;
