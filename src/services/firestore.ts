import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { saveActivityOffline, getOfflineActivities, clearOfflineActivities } from "./indexedDB";

const ACTIVITIES_COLLECTION = "activities";

// ✅ Add activity with offline handling
export const addActivity = async (userId: string, type: string, details: string) => {
  const activity = {
    userId,
    type,
    details,
    timestamp: new Date().toISOString(),
  };

  if (navigator.onLine) {
    // ✅ If online, save directly to Firestore
    await addDoc(collection(db, ACTIVITIES_COLLECTION), activity);
  } else {
    // ✅ If offline, save to IndexedDB
    await saveActivityOffline(activity);
    console.log("Saved activity offline:", activity);
  }
};

// ✅ Edit an existing activity
export const editActivity = async (activityId: string, updatedType: string, updatedDetails: string) => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, {
      type: updatedType,
      details: updatedDetails,
    });
    console.log(`Activity ${activityId} updated successfully.`);
  } catch (error) {
    console.error("Error updating activity:", error);
  }
};

// ✅ Delete an activity
export const deleteActivity = async (activityId: string) => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await deleteDoc(activityRef);
    console.log(`Activity ${activityId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting activity:", error);
  }
};

// ✅ Sync offline activities to Firestore when back online
export const syncOfflineActivities = async () => {
  if (!navigator.onLine) return;

  const offlineActivities = await getOfflineActivities();
  if (offlineActivities.length === 0) return;

  console.log("Syncing offline activities to Firestore...");

  for (const activity of offlineActivities) {
    await addDoc(collection(db, ACTIVITIES_COLLECTION), activity);
  }

  await clearOfflineActivities();
  console.log("Offline activities synced!");
};

// ✅ Automatically sync when network is restored
window.addEventListener("online", async () => {
  await syncOfflineActivities(); // ✅ No need to pass userId
});

// ✅ Get user activities from Firestore
export const getUserActivities = async (userId: string) => {
  try {
    const q = query(collection(db, ACTIVITIES_COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
