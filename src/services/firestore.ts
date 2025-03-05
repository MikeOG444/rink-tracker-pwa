import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc, increment } from "firebase/firestore";
import { saveActivityOffline, getOfflineActivities, clearOfflineActivities } from "./indexedDB";
import { Rink } from "./placesAPI";

const ACTIVITIES_COLLECTION = "activities";
const RINKS_COLLECTION = "rinks";
const USER_RINKS_COLLECTION = "user_rinks";

// ✅ Add activity with offline handling and optional rink information
export const addActivity = async (userId: string, type: string, details: string, rink?: Rink) => {
    const activity = {
        userId,
        type,
        details,
        timestamp: new Date().toISOString(),
        rink: rink ? {
            id: rink.id,
            name: rink.name,
            address: rink.address,
            position: rink.position,
            photo: rink.photo
        } : undefined
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

// ✅ Save a rink that the user has visited
export const saveVisitedRink = async (userId: string, rink: Rink) => {
    try {
        console.log("🔥 Saving visited rink:", rink.name);
        
        // First, save the rink to the global rinks collection if it doesn't exist
        const rinkRef = doc(db, RINKS_COLLECTION, rink.id);
        const rinkDoc = await getDoc(rinkRef);
        
        if (!rinkDoc.exists()) {
            // Save basic rink info to the global rinks collection
            await setDoc(rinkRef, {
                id: rink.id,
                name: rink.name,
                address: rink.address,
                position: rink.position,
                photo: rink.photo,
                rating: rink.rating,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log("✅ Rink added to global collection:", rink.name);
        } else {
            // Update the rink info in case anything has changed
            await updateDoc(rinkRef, {
                name: rink.name,
                address: rink.address,
                position: rink.position,
                photo: rink.photo,
                rating: rink.rating,
                updatedAt: new Date().toISOString()
            });
            console.log("✅ Rink updated in global collection:", rink.name);
        }
        
        // Then, save or update the user-specific rink info
        const userRinkRef = doc(db, USER_RINKS_COLLECTION, `${userId}_${rink.id}`);
        const userRinkDoc = await getDoc(userRinkRef);
        
        if (!userRinkDoc.exists()) {
            // First visit to this rink
            await setDoc(userRinkRef, {
                userId,
                rinkId: rink.id,
                visitCount: 1,
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString()
            });
            console.log("✅ First visit to rink recorded for user");
        } else {
            // Update visit count and last visit date
            await updateDoc(userRinkRef, {
                visitCount: increment(1),
                lastVisit: new Date().toISOString()
            });
            console.log("✅ Visit count updated for rink");
        }
        
        return true;
    } catch (error) {
        console.error("❌ Error saving visited rink:", error);
        return false;
    }
};

// ✅ Get all rinks that a user has visited
export const getUserVisitedRinks = async (userId: string): Promise<Rink[]> => {
    try {
        console.log("📡 Fetching visited rinks for user:", userId);
        
        // Query the user_rinks collection for this user
        const q = query(
            collection(db, USER_RINKS_COLLECTION),
            where("userId", "==", userId)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.warn("⚠️ No visited rinks found for user:", userId);
            return [];
        }
        
        // Get the rink IDs and visit counts
        const userRinks = snapshot.docs.map(doc => doc.data());
        
        // Fetch the actual rink details from the rinks collection
        const rinks: Rink[] = [];
        
        for (const userRink of userRinks) {
            const rinkRef = doc(db, RINKS_COLLECTION, userRink.rinkId);
            const rinkDoc = await getDoc(rinkRef);
            
            if (rinkDoc.exists()) {
                const rinkData = rinkDoc.data();
                rinks.push({
                    id: rinkData.id,
                    name: rinkData.name,
                    address: rinkData.address,
                    position: rinkData.position,
                    photo: rinkData.photo,
                    rating: rinkData.rating,
                    visitCount: userRink.visitCount,
                    lastVisit: userRink.lastVisit
                });
            }
        }
        
        console.log("✅ Retrieved", rinks.length, "visited rinks");
        return rinks;
    } catch (error) {
        console.error("❌ Error fetching visited rinks:", error);
        return [];
    }
};

// ✅ Check if a user has visited a specific rink
export const hasUserVisitedRink = async (userId: string, rinkId: string): Promise<boolean> => {
    try {
        const userRinkRef = doc(db, USER_RINKS_COLLECTION, `${userId}_${rinkId}`);
        const userRinkDoc = await getDoc(userRinkRef);
        
        return userRinkDoc.exists();
    } catch (error) {
        console.error("❌ Error checking if user visited rink:", error);
        return false;
    }
};

// ✅ Get visit count for a specific rink
export const getRinkVisitCount = async (userId: string, rinkId: string): Promise<number> => {
    try {
        const userRinkRef = doc(db, USER_RINKS_COLLECTION, `${userId}_${rinkId}`);
        const userRinkDoc = await getDoc(userRinkRef);
        
        if (userRinkDoc.exists()) {
            const data = userRinkDoc.data();
            return data.visitCount || 0;
        }
        
        return 0;
    } catch (error) {
        console.error("❌ Error getting rink visit count:", error);
        return 0;
    }
};
