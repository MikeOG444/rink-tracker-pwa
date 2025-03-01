import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h2" fontWeight="bold" color="white">
        Welcome to Rink Tracker
      </Typography>
      <Typography variant="h5" color="#E0E0E0" sx={{ mt: 2 }}>
        Track your hockey journey, log your rink visits, and compete with friends!
      </Typography>
      <Box sx={{ mt: 5 }}>
        {user ? (
          <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate("/auth")} 
              sx={{ mr: 2, fontWeight: "bold", px: 3, py: 1 }}
            >
              Sign In
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate("/auth")}
              sx={{ fontWeight: "bold", px: 3, py: 1 }}
            >
              Get Started
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
