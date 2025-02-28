import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addActivity, getUserActivities, editActivity, deleteActivity } from "../../services/firestore";
import {
  Container, Typography, TextField, Select, MenuItem,
  Card, CardContent, Avatar, Box, List, IconButton, Button
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
      console.log("📡 Fetching latest activities for user:", user.uid);
      const logs = await getUserActivities(user.uid);
  
      if (logs.length === 0) {
        console.warn("⚠️ No activities found in Firestore for user:", user.uid);
      } else {
        console.log("✅ Activities retrieved and updating state:", logs);
      }
  
      // Force a re-render by explicitly updating state in a new array reference
      setActivities([...logs]); 
    }
  };
  

  const handleLogActivity = async () => {
    console.log("📌 Log Activity button clicked"); // ✅ Check if function executes
  
    if (!activityType || !activityDetails) {
      console.warn("⚠️ Missing activity type or details!");
      return;
    }
  
    if (!user) {
      console.error("❌ User is undefined!");
      return;
    }
  
    try {
      if (editMode && editActivityId) {
        console.log("✏️ Editing activity:", editActivityId);
        await editActivity(editActivityId, activityType, activityDetails);
        setEditMode(false);
        setEditActivityId(null);
      } else {
        console.log("✅ Adding new activity:", { userId: user.uid, activityType, activityDetails });
        await addActivity(user.uid, activityType, activityDetails);
      }
  
      setActivityType("");
      setActivityDetails("");
      fetchActivities();
      console.log("🎉 Activity successfully logged!");
    } catch (error) {
      console.error("🔥 Error logging activity:", error);
    }
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
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogActivity}
            sx={{ mt: 2 }}
          >
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
                <Card key={activity.id} sx={{ mb: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {activity.type}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.details}
                    </Typography>
                    <Typography variant="caption" color="gray">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <IconButton onClick={() => handleEdit(activity)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(activity.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
