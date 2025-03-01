import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth, googleProvider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
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
  const [isSignUp, setIsSignUp] = useState(false);

  // ✅ Redirect user to dashboard if already signed in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      navigate("/dashboard"); // ✅ Redirect after signup
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
      
      {isSignUp && (
        <TextField
          fullWidth
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{ mt: 3, bgcolor: "white", borderRadius: 1 }}
          required
        />
      )}
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mt: isSignUp ? 2 : 3, bgcolor: "white", borderRadius: 1 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mt: 2, bgcolor: "white", borderRadius: 1 }}
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
            onClick={() => setIsSignUp(false)} 
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </>
      ) : (
        <>
          <Button fullWidth variant="contained" color="primary" onClick={handleLogin} sx={{ mt: 3 }}>
            Login
          </Button>
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary" 
            onClick={() => setIsSignUp(true)} 
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
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
