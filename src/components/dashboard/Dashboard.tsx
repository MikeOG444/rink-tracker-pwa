import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { addActivity, getUserActivities, editActivity, deleteActivity } from "../../services/firestore";
import {
  Container, Typography, TextField, Select, MenuItem,
  Card, CardContent, Avatar, Box, List, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
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
  const [validationErrors, setValidationErrors] = useState<{
    activityType?: string;
    activityDetails?: string;
  }>({});

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
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validate inputs
    const errors: {
      activityType?: string;
      activityDetails?: string;
    } = {};
    
    if (!activityType) {
      errors.activityType = "Please select an activity type";
    }
    
    if (!activityDetails) {
      errors.activityDetails = "Please enter activity details";
    }
    
    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      console.warn("⚠️ Validation errors:", errors);
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

  const handleDeleteClick = (activityId: string) => {
    setActivityToDelete(activityId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      await deleteActivity(activityToDelete);
      fetchActivities();
      setDeleteConfirmOpen(false);
      setActivityToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setActivityToDelete(null);
  };

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim() || !user) return;

    try {
      await updateProfile(user!, { displayName });
      console.log("✅ Display name updated successfully:", displayName);
      setIsNameModalOpen(false);
    } catch (error) {
      console.error("❌ Error updating display name:", error);
    }
  };

  const openNameModal = () => {
    setDisplayName(user?.displayName || "");
    setIsNameModalOpen(true);
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
        <Avatar
          src={user?.photoURL || "/default-avatar.png"} // Fallback image if no photoURL
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            bgcolor: "primary.main", // Adds contrast for better visibility
          }}
        >
          {!user?.photoURL && (
            <Typography variant="h5" color="white">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "?"}
            </Typography>
          )}
        </Avatar>
        <Box display="flex" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {user?.displayName || "Dirk Dangler"}
          </Typography>
          <IconButton 
            color="primary" 
            onClick={openNameModal} 
            sx={{ ml: 1 }}
          >
            <EditIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" sx={{ color: "#E0E0E0" }}>
          {user?.email}
        </Typography>
      </Box>

      {/* Edit Name Modal */}
      <Dialog open={isNameModalOpen} onClose={() => setIsNameModalOpen(false)}>
        <DialogTitle>Edit Display Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Display Name"
            type="text"
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNameModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateDisplayName} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this activity?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mt: 4, p: 2, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Activity" : "Log a New Activity"}
          </Typography>
          <Select
            fullWidth
            value={activityType}
            onChange={(e) => {
              setActivityType(e.target.value);
              // Clear validation error when user selects a value
              if (validationErrors.activityType) {
                setValidationErrors(prev => ({ ...prev, activityType: undefined }));
              }
            }}
            displayEmpty
            sx={{ mt: 2 }}
            error={!!validationErrors.activityType}
            required
          >
            <MenuItem value="" disabled>Select Activity Type *</MenuItem>
            <MenuItem value="Game">Game</MenuItem>
            <MenuItem value="Practice">Practice</MenuItem>
            <MenuItem value="Skills Session">Skills Session</MenuItem>
            <MenuItem value="Open Skate">Open Skate</MenuItem>
          </Select>
          {validationErrors.activityType && (
            <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
              {validationErrors.activityType}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Activity Details"
            value={activityDetails}
            onChange={(e) => {
              setActivityDetails(e.target.value);
              // Clear validation error when user types
              if (validationErrors.activityDetails) {
                setValidationErrors(prev => ({ ...prev, activityDetails: undefined }));
              }
            }}
            sx={{ mt: 2 }}
            error={!!validationErrors.activityDetails}
            helperText={validationErrors.activityDetails}
            required
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

      <Card sx={{ mt: 4, p: 2, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)" }}>
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
                <Card key={activity.id || activity.timestamp} sx={{ mb: 2, p: 2, bgcolor: "#3A3A3A" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {activity.type} {activity.offline && " ⏳ (Pending Sync)"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.details}
                    </Typography>
                    <Typography variant="caption" color="#E0E0E0">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <IconButton onClick={() => handleEdit(activity)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(activity.id)} color="error">
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
