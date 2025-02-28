import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { addActivity, getUserActivities } from "../../services/firestore";
import {
  Container, Typography, Button, TextField, Select, MenuItem,
  Card, CardContent, Avatar, Box, List, ListItem, ListItemText
} from "@mui/material";

const Dashboard = () => {
  const { user } = useAuth();
  const [activityType, setActivityType] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState("newest"); // Sorting state
  const [filterType, setFilterType] = useState(""); // Filtering state

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (user) {
      const logs = await getUserActivities(user.uid);
      setActivities(logs);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleLogActivity = async () => {
    if (!activityType || !activityDetails) return;

    // ✅ Save activity offline if no internet connection
    await addActivity(user!.uid, activityType, activityDetails, !navigator.onLine);

    setActivityType("");
    setActivityDetails("");
    fetchActivities();
  };

  // Sorting activities
  const sortedActivities = [...activities].sort((a, b) => {
    return sortOrder === "newest"
      ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Filtering activities
  const filteredActivities = filterType
    ? sortedActivities.filter((activity) => activity.type === filterType)
    : sortedActivities;

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Avatar src={user?.photoURL || ""} sx={{ width: 80, height: 80, mb: 2 }} />
        <Typography variant="h5" fontWeight="bold">
          {user?.displayName || "No Name"}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {user?.email}
        </Typography>
      </Box>

      <Card sx={{ mt: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Log a New Activity
          </Typography>
          <Select
            fullWidth
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="" disabled>Select Activity Type</MenuItem>
            <MenuItem value="Game">Game</MenuItem>
            <MenuItem value="Practice">Practice</MenuItem>
            <MenuItem value="Skills Session">Skills Session</MenuItem>
            <MenuItem value="Open Skate">Open Skate</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Activity Details"
            value={activityDetails}
            onChange={(e) => setActivityDetails(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleLogActivity} sx={{ mt: 2 }}>
            Log Activity
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Your Activities
          </Typography>

          {/* Sorting & Filtering Controls */}
          <Select
            fullWidth
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>

          <Select
            fullWidth
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="">All Activities</MenuItem>
            <MenuItem value="Game">Games</MenuItem>
            <MenuItem value="Practice">Practices</MenuItem>
            <MenuItem value="Skills Session">Skills Sessions</MenuItem>
            <MenuItem value="Open Skate">Open Skates</MenuItem>
          </Select>

          {/* Activity List */}
          <List sx={{ mt: 2 }}>
            {filteredActivities.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No activities found.
              </Typography>
            ) : (
              filteredActivities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemText
                    primary={activity.type}
                    secondary={`${activity.details} - ${new Date(activity.timestamp).toLocaleString()}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        </CardContent>
      </Card>

      <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mt: 4 }}>
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;
