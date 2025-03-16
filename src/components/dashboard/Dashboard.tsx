import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import {
  Container, Typography, TextField, Select, MenuItem,
  Card, CardContent, Avatar, Box, List, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { activityRepository, userRinkRepository } from "../../domain/repositories";
import { Activity } from "../../domain/models/Activity";
import ActivityType, { getActivityTypeLabel } from "../../domain/models/ActivityType";
import RinkSelectionModal from "./RinkSelectionModal";
import { Rink } from "../../services/places";
import { geolocationService } from "../../services/location/GeolocationService";
import { isWithinDistance } from "../../utils/geoUtils";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activityType, setActivityType] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [validationErrors, setValidationErrors] = useState<{
    activityType?: string;
    activityDetails?: string;
    rink?: string;
  }>({});
  
  // State for rink selection
  const [selectedRink, setSelectedRink] = useState<Rink | null>(null);
  const [isRinkModalOpen, setIsRinkModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [rinkPreSelected, setRinkPreSelected] = useState(false);
  
  // State for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");

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

    try {
      // Fetch activities using the repository
      const userActivities = await activityRepository.findByUserId(user.uid);
      
      // Convert domain model activities to UI-friendly format
      const activitiesForUI = userActivities.map(activity => ({
        id: activity.id,
        type: getActivityTypeLabel(activity.type),
        details: activity.notes || "",
        timestamp: activity.date,
        offline: false, // This will be handled by the repository
        rink: null // This will be handled by the repository
      }));

      setActivities(activitiesForUI);
      console.log("✅ Activities updated in state:", activitiesForUI.length);
    } catch (error) {
      console.error("❌ Error fetching activities:", error);
    }
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

  // Check for rink information in location state
  useEffect(() => {
    // Check if we have rink information from the map
    const state = location.state as { logActivity?: boolean; rink?: Rink } | null;
    
    if (state?.logActivity && state.rink) {
      console.log("📍 Received rink information:", state.rink);
      
      // Pre-select "Open Skate" as default activity type
      setActivityType("Open Skate");
      
      // Set the selected rink (ensure it's a valid Rink object)
      if (state.rink.id && state.rink.name && state.rink.address) {
        setSelectedRink(state.rink);
        
        // Pre-populate activity details
        setActivityDetails(`Skated at ${state.rink.name}`);
        
        // Set flag to show notification
        setRinkPreSelected(true);
      }
    }
  }, [location.state]);
  
  // Handle opening the rink selection modal
  const handleOpenRinkModal = () => {
    setIsRinkModalOpen(true);
  };
  
  // Handle rink selection
  const handleSelectRink = (rink: Rink) => {
    setSelectedRink(rink);
    
    // Clear any validation errors
    if (validationErrors.rink) {
      setValidationErrors(prev => ({ ...prev, rink: undefined }));
    }
    
    // Update activity details with rink name if it's empty or contains default text
    if (!activityDetails || activityDetails.startsWith("Skated at ")) {
      setActivityDetails(`Skated at ${rink.name}`);
    }
  };

  const handleLogActivity = async () => {
    console.log("📌 Log Activity button clicked");
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validate inputs
    const errors: {
      activityType?: string;
      activityDetails?: string;
      rink?: string;
    } = {};
    
    if (!activityType) {
      errors.activityType = "Please select an activity type";
    }
    
    if (!activityDetails) {
      errors.activityDetails = "Please enter activity details";
    }
    
    if (!selectedRink) {
      errors.rink = "Please select a rink for this activity";
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
      console.log("✅ Adding new activity:", { 
        userId: user.uid, 
        activityType, 
        activityDetails,
        rink: selectedRink?.name
      });
      
      // Map UI activity type to domain model activity type
      let activityTypeEnum: ActivityType;
      switch (activityType) {
        case "Game":
          activityTypeEnum = ActivityType.HOCKEY_GAME;
          break;
        case "Practice":
          activityTypeEnum = ActivityType.HOCKEY_PRACTICE;
          break;
        case "Skills Session":
          activityTypeEnum = ActivityType.HOCKEY_CLINIC;
          break;
        case "Open Skate":
          activityTypeEnum = ActivityType.RECREATIONAL_SKATING;
          break;
        default:
          activityTypeEnum = ActivityType.OTHER;
      }
      
      // Create a new activity with the selected rink ID
      // We've already validated that selectedRink is not null in the validation step above
      if (!selectedRink) {
        throw new Error("Rink selection is required");
      }
      
      const activity = Activity.create(user.uid, selectedRink.id, activityTypeEnum);
      activity.notes = activityDetails;
      
      // Save the activity
      await activityRepository.save(activity);
      
      // Check if the user is at the rink (within 500 feet)
      const userLocationResult = await geolocationService.getCurrentLocation(true); // Force fresh location
      const isVerified = isWithinDistance(
        userLocationResult.location,
        selectedRink.position,
        500 // 500 feet threshold
      );
      
      console.log(`📍 User is ${isVerified ? 'at' : 'not at'} the rink. Visit verification: ${isVerified ? 'VERIFIED' : 'NOT VERIFIED'}`);
      
      // Increment the visit count for this rink in the user's profile
      // We can safely use ! here because we've already validated that selectedRink is not null
      await userRinkRepository.incrementVisitCount(user.uid, selectedRink.id, selectedRink, isVerified);
      
      // Show verification status to user
      if (isVerified) {
        setSnackbarMessage("Activity logged with verified location! ✅");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Activity logged successfully");
        setSnackbarSeverity("info");
      }
      setSnackbarOpen(true);
      
      // Reset form
      setActivityType("");
      setActivityDetails("");
      setSelectedRink(null);
      setRinkPreSelected(false);
      
      // Refresh activities list
      fetchActivities();
      console.log("🎉 Activity successfully logged!");
    } catch (error) {
      console.error("🔥 Error logging activity:", error);
      setSnackbarMessage("Error logging activity");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // This function starts editing an activity in-place
  const handleEdit = (activity: any) => {
    setEditingActivity(activity.id);
  };

  // This function saves the edited activity
  const handleSaveEdit = async (activityId: string, newType: string, newDetails: string) => {
    if (!user) {
      console.error("❌ User is undefined!");
      return;
    }

    try {
      console.log("✏️ Saving edited activity:", activityId);
      
      // Get the existing activity
      const activity = await activityRepository.findById(activityId);
      
      if (!activity) {
        console.error("❌ Activity not found:", activityId);
        return;
      }
      
      // Map UI activity type to domain model activity type
      let activityTypeEnum: ActivityType;
      switch (newType) {
        case "Game":
          activityTypeEnum = ActivityType.HOCKEY_GAME;
          break;
        case "Practice":
          activityTypeEnum = ActivityType.HOCKEY_PRACTICE;
          break;
        case "Skills Session":
          activityTypeEnum = ActivityType.HOCKEY_CLINIC;
          break;
        case "Open Skate":
          activityTypeEnum = ActivityType.RECREATIONAL_SKATING;
          break;
        default:
          activityTypeEnum = ActivityType.OTHER;
      }
      
      // Update the activity
      activity.type = activityTypeEnum;
      activity.notes = newDetails;
      
      // Save the updated activity
      await activityRepository.save(activity);
      
      setEditingActivity(null);
      fetchActivities();
    } catch (error) {
      console.error("🔥 Error saving activity:", error);
    }
  };

  // This function cancels editing
  const handleCancelEdit = () => {
    setEditingActivity(null);
  };

  const handleDeleteClick = (activityId: string) => {
    setActivityToDelete(activityId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      try {
        await activityRepository.delete(activityToDelete);
        fetchActivities();
        setDeleteConfirmOpen(false);
        setActivityToDelete(null);
      } catch (error) {
        console.error("🔥 Error deleting activity:", error);
      }
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
            Log a New Activity
          </Typography>
          
          {/* Rink pre-selected notification */}
          {rinkPreSelected && (
            <Box 
              sx={{ 
                bgcolor: "success.dark", 
                color: "white", 
                p: 1.5, 
                borderRadius: 1, 
                mt: 1, 
                mb: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography variant="body2">
                ✅ Rink information pre-filled from map selection
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                color="inherit" 
                sx={{ ml: 1, fontSize: "0.7rem" }}
                onClick={() => setRinkPreSelected(false)}
              >
                Dismiss
              </Button>
            </Box>
          )}
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
          
          {/* Rink Selection Button */}
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              border: '1px dashed',
              borderColor: validationErrors.rink ? 'error.main' : 'divider',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {selectedRink ? (
              <>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedRink.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRink.address}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={handleOpenRinkModal}
                >
                  Change
                </Button>
              </>
            ) : (
              <>
                <Typography color={validationErrors.rink ? "error" : "inherit"}>
                  Select a rink for this activity *
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<LocationOnIcon />}
                  onClick={handleOpenRinkModal}
                  color={validationErrors.rink ? "error" : "primary"}
                >
                  Select Rink
                </Button>
              </>
            )}
          </Box>
          {validationErrors.rink && (
            <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
              {validationErrors.rink}
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
            Log Activity
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4, p: 2, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Your Activities
              </Typography>
              {activities.length > 0 && (
                <Typography variant="caption" color="#E0E0E0">
                  {activities.filter(activity => filterType === "all" || activity.type === filterType).length} 
                  {filterType !== "all" ? ` ${filterType} activities` : " activities"}
                </Typography>
              )}
            </Box>
            <Box display="flex" gap={1}>
              <Select
                size="small"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Game">Game</MenuItem>
                <MenuItem value="Practice">Practice</MenuItem>
                <MenuItem value="Skills Session">Skills Session</MenuItem>
                <MenuItem value="Open Skate">Open Skate</MenuItem>
              </Select>
              <Select
                size="small"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </Box>
          </Box>
          <List sx={{ mt: 2 }}>
            {activities.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No activities found.
              </Typography>
            ) : (
              activities
                .filter(activity => filterType === "all" || activity.type === filterType)
                .sort((a, b) => {
                  const dateA = new Date(a.timestamp).getTime();
                  const dateB = new Date(b.timestamp).getTime();
                  return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
                })
                .map((activity) => (
                <Card 
                  key={activity.id || activity.timestamp} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: editingActivity === activity.id ? "#2A4D69" : "#3A3A3A", // Highlight when editing
                    transition: "background-color 0.3s ease"
                  }}
                >
                  <CardContent>
                    {editingActivity === activity.id ? (
                      // Editing mode
                      <>
                        <Select
                          fullWidth
                          value={activity.type}
                          onChange={(e) => {
                            // Update activity type in local state
                            const updatedActivities = activities.map(a => 
                              a.id === activity.id ? { ...a, type: e.target.value } : a
                            );
                            setActivities(updatedActivities);
                          }}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="Game">Game</MenuItem>
                          <MenuItem value="Practice">Practice</MenuItem>
                          <MenuItem value="Skills Session">Skills Session</MenuItem>
                          <MenuItem value="Open Skate">Open Skate</MenuItem>
                        </Select>
                        <TextField
                          fullWidth
                          multiline
                          label="Activity Details"
                          value={activity.details}
                          onChange={(e) => {
                            // Update activity details in local state
                            const updatedActivities = activities.map(a => 
                              a.id === activity.id ? { ...a, details: e.target.value } : a
                            );
                            setActivities(updatedActivities);
                          }}
                          sx={{ mb: 2 }}
                        />
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <Button 
                            variant="outlined" 
                            color="secondary"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleSaveEdit(activity.id, activity.type, activity.details)}
                          >
                            Save
                          </Button>
                        </Box>
                      </>
                    ) : (
                      // View mode
                      <>
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
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </List>
        </CardContent>
      </Card>
      
      {/* Rink Selection Modal */}
      <RinkSelectionModal
        open={isRinkModalOpen}
        onClose={() => setIsRinkModalOpen(false)}
        onSelectRink={handleSelectRink}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
