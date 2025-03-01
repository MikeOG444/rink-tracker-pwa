import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth, googleProvider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
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
  const [error, setError] = useState("");

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
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // ✅ Redirect after signup
    } catch (err: any) {
      setError("Error creating account. Ensure email is valid and password is at least 6 characters.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ textAlign: "center", mt: 5, bgcolor: "#1E1E1E", p: 4, borderRadius: 2 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: "white", mb: 3 }}>
        Welcome to Rink Tracker
      </Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mt: 3, bgcolor: "white", borderRadius: 1 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mt: 2, bgcolor: "white", borderRadius: 1 }}
      />
      <Button fullWidth variant="contained" color="primary" onClick={handleLogin} sx={{ mt: 3 }}>
        Login
      </Button>
      <Button fullWidth variant="outlined" color="secondary" onClick={handleSignup} sx={{ mt: 2 }}>
        Sign Up
      </Button>

      <Divider sx={{ my: 3, bgcolor: "white" }}>OR</Divider>

      <Button
        fullWidth
        variant="contained"
        startIcon={<GoogleIcon />}
        sx={{ bgcolor: "white", color: "black" }}
        onClick={handleGoogleSignIn}
      >
        Sign in with Google
      </Button>
    </Container>
  );
};

export default AuthPage;
