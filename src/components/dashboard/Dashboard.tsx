import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { addActivity, getUserActivities, editActivity, deleteActivity } from "../../services/firestore";
import {
  Container, Typography, Button, TextField, Select, MenuItem, 
  Card, CardContent, Avatar, Box, List, ListItem, ListItemText, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Dashboard = () => {
  const { user } = useAuth();
  const [activityType, setActivityType] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editActivityId, setEditActivityId] = useState<string | null>(null);

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

    if (editMode && editActivityId) {
      await editActivity(editActivityId, activityType, activityDetails);
      setEditMode(false);
      setEditActivityId(null);
    } else {
      await addActivity(user!.uid, activityType, activityDetails);
    }

    setActivityType("");
    setActivityDetails("");
    fetchActivities();
  };

  const handleEdit = (activity: any) => {
    setActivityType(activity.type);
    setActivityDetails(activity.details);
    setEditActivityId(activity.id);
    setEditMode(true);
  };

  const handleDelete = async (activityId: string) => {
    await deleteActivity(activityId);
    fetchActivities();
  };

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
            {editMode ? "Edit Activity" : "Log a New Activity"}
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
            {editMode ? "Update Activity" : "Log Activity"}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Your Activities
          </Typography>
          <List sx={{ mt: 2 }}>
            {activities.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No activities found.
              </Typography>
            ) : (
              activities.map((activity) => (
                <ListItem key={activity.id}
                  secondaryAction={
                    <>
                      <IconButton onClick={() => handleEdit(activity)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(activity.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
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
