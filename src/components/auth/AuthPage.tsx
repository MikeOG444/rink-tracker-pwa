import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, TextField, Box, Alert
} from "@mui/material";

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
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" fontWeight="bold">Welcome to Rink Tracker</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 3 }} />
      <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 2 }} />
      <Button fullWidth variant="contained" color="primary" onClick={handleLogin} sx={{ mt: 3 }}>Login</Button>
      <Button fullWidth variant="outlined" color="secondary" onClick={handleSignup} sx={{ mt: 2 }}>Sign Up</Button>
    </Container>
  );
};

export default AuthPage;
