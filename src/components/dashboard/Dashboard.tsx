import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addActivity, getUserActivities, editActivity, deleteActivity } from "../../services/firestore";
import {
  Container, Typography, TextField, Select, MenuItem,
  Card, CardContent, Avatar, Box, List, IconButton, Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getOfflineActivities } from "../../services/indexedDB";

const Dashboard = () => {
  const { user } = useAuth();
  const [activityType, setActivityType] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editActivityId, setEditActivityId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Listen for network changes
  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Function to trigger manual sync
  const handleSyncNow = async () => {
    console.log("🔄 Attempting to sync offline activities...");
    await fetchActivities();
  };

  const fetchActivities = async () => {
    if (!user) return;
  
    console.log("📡 Fetching latest activities for user:", user.uid);
  
    // Fetch Firestore activities
    const onlineActivities = await getUserActivities(user.uid);
  
    // Fetch IndexedDB offline activities
    const offlineActivities: any[] = await getOfflineActivities();
  
    // ✅ Ensure offline activities have a pending sync flag
    const offlineActivitiesWithFlag = offlineActivities.map(activity => ({
      ...activity,
      offline: true, // Mark as waiting for sync
      id: `offline-${activity.timestamp}`, // Unique ID for offline items
    }));
  
    // ✅ Merge online and offline activities
    const allActivities = [...offlineActivitiesWithFlag, ...onlineActivities];
  
    // ✅ Ensure activities are sorted and unique
    const uniqueActivities = Array.from(
      new Map(allActivities.map((activity) => [activity.id, activity])).values()
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
    setActivities(uniqueActivities);
    console.log("✅ Activities updated in state:", uniqueActivities);
  };
  

  // Auto-refresh when offline activities sync
  useEffect(() => {
    window.addEventListener("activitiesUpdated", fetchActivities);
    return () => window.removeEventListener("activitiesUpdated", fetchActivities);
  }, []);

  // Fetch activities when user logs in
  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const handleLogActivity = async () => {
    console.log("📌 Log Activity button clicked");

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
      {/* ✅ Offline Mode Banner */}
      {isOffline && (
        <Box sx={{ bgcolor: "orange", color: "black", p: 2, textAlign: "center" }}>
          <Typography variant="body1">⚠️ You are offline. Activities will sync once you reconnect.</Typography>
          <Button variant="contained" color="secondary" sx={{ mt: 1 }} onClick={handleSyncNow}>
            Sync Now
          </Button>
        </Box>
      )}

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
                <Card key={activity.id || activity.timestamp} sx={{ mb: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {activity.type} {activity.offline && " ⏳ (Pending Sync)"}
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
