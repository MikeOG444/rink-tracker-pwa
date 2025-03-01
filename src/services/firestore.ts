import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
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

    try {
        if (navigator.onLine) {
            console.log("🔥 Attempting to add activity to Firestore:", activity);
            const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), activity);
            console.log("✅ Activity added to Firestore with ID:", docRef.id);
        } else {
            console.log("📴 Offline - Saving activity to IndexedDB:", activity);
            await saveActivityOffline(activity);
        }
    } catch (error) {
        console.error("❌ Error adding activity to Firestore:", error);
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
        console.error("❌ Error updating activity:", error);
    }
};

// ✅ Delete an activity
export const deleteActivity = async (activityId: string) => {
    try {
        const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
        await deleteDoc(activityRef);
        console.log(`Activity ${activityId} deleted successfully.`);
    } catch (error) {
        console.error("❌ Error deleting activity:", error);
    }
};

// ✅ Sync offline activities to Firestore when back online
export const syncOfflineActivities = async () => {
    if (!navigator.onLine) return;
  
    const offlineActivities = await getOfflineActivities();
    if (offlineActivities.length === 0) return;
  
    console.log("📡 Syncing offline activities to Firestore...");
  
    for (const activity of offlineActivities) {
      await addDoc(collection(db, ACTIVITIES_COLLECTION), activity);
    }
  
    await clearOfflineActivities();
    console.log("✅ Offline activities synced!");
  
    // 🔥 Notify Dashboard to refresh
    window.dispatchEvent(new Event("activitiesUpdated"));
  };
  

// ✅ Automatically sync when network is restored
window.addEventListener("online", async () => {
    await syncOfflineActivities();
});

// ✅ Get user activities from Firestore (Ordered by Most Recent First)
export const getUserActivities = async (userId: string) => {
    try {
        console.log("📡 Fetching activities for user:", userId);
        const q = query(
            collection(db, ACTIVITIES_COLLECTION),
            where("userId", "==", userId),
            orderBy("timestamp", "desc") // 🔥 Sorting by timestamp (most recent first)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.warn("⚠️ No activities found for user:", userId);
        }

        const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("✅ Activities retrieved from Firestore:", activities);

        return activities;
    } catch (error) {
        console.error("❌ Error fetching activities from Firestore:", error);
        return [];
    }
};
