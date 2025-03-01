import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#1E1E1E", p: 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/")}>
          Rink Tracker
        </Typography>
        {user && (
          <Box>
            <Button color="inherit" onClick={() => navigate("/dashboard")} sx={{ mr: 2 }}>
              Dashboard
            </Button>
            <Button color="error" variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
