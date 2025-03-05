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
    <AppBar position="static" sx={{ bgcolor: "#252525", p: 1, boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/")}>
          Rink Tracker
        </Typography>
        <Box sx={{ display: 'flex' }}>
          {/* Map button is always visible */}
          <Button 
            color="inherit" 
            onClick={() => navigate("/map")} 
            sx={{ 
              mr: 2, 
              fontWeight: "bold",
              '&:hover': {
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }
            }}
          >
            Map
          </Button>
          
          {/* User-specific buttons */}
          {user && (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate("/dashboard")} 
                sx={{ 
                  mr: 2, 
                  fontWeight: "bold",
                  '&:hover': {
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }
                }}
              >
                Dashboard
              </Button>
              <Button color="error" variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
