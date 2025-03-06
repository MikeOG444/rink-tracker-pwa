import { db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from "firebase/firestore";
import { Activity } from "../models/Activity";
import { ActivityRepository } from "./ActivityRepository";
import { saveActivityOffline, getOfflineActivities, clearOfflineActivities } from "../../services/indexedDB";

const ACTIVITIES_COLLECTION = "activities";

/**
 * Firestore implementation of the ActivityRepository interface
 */
export class FirestoreActivityRepository implements ActivityRepository {
  /**
   * Find an activity by its ID
   * @param id The activity ID
   * @returns A promise that resolves to the activity or null if not found
   */
  async findById(id: string): Promise<Activity | null> {
    try {
      const activityRef = doc(db, ACTIVITIES_COLLECTION, id);
      const activityDoc = await getDoc(activityRef);
      
      if (!activityDoc.exists()) {
        return null;
      }
      
      return Activity.fromFirestore(id, activityDoc.data());
    } catch (error) {
      console.error("❌ Error finding activity by ID:", error);
      return null;
    }
  }
  
  /**
   * Find all activities
   * @returns A promise that resolves to an array of activities
   */
  async findAll(): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        Activity.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding all activities:", error);
      return [];
    }
  }
  
  /**
   * Find activities by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of activities
   */
  async findByUserId(userId: string): Promise<Activity[]> {
    try {
      console.log("📡 Fetching activities for user:", userId);
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.warn("⚠️ No activities found for user:", userId);
      }
      
      const activities = snapshot.docs.map(doc => 
        Activity.fromFirestore(doc.id, doc.data())
      );
      
      console.log("✅ Activities retrieved from Firestore:", activities.length);
      
      return activities;
    } catch (error) {
      console.error("❌ Error finding activities by user ID:", error);
      return [];
    }
  }
  
  /**
   * Find activities by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  async findByRinkId(rinkId: string): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        Activity.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding activities by rink ID:", error);
      return [];
    }
  }
  
  /**
   * Find activities by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  async findByUserIdAndRinkId(userId: string, rinkId: string): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where("userId", "==", userId),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        Activity.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding activities by user ID and rink ID:", error);
      return [];
    }
  }
  
  /**
   * Save an activity (create or update)
   * @param activity The activity to save
   * @returns A promise that resolves to the saved activity
   */
  async save(activity: Activity): Promise<Activity> {
    try {
      if (navigator.onLine) {
        const activityData = activity.toObject();
        
        if (activity.id) {
          // Update existing activity
          const activityRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
          await updateDoc(activityRef, activityData);
          console.log("✅ Activity updated in Firestore:", activity.id);
        } else {
          // Create new activity
          const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), activityData);
          activity.id = docRef.id;
          console.log("✅ Activity added to Firestore with ID:", docRef.id);
        }
        
        return activity;
      } else {
        // Save offline
        await this.saveOffline(activity);
        return activity;
      }
    } catch (error) {
      console.error("❌ Error saving activity:", error);
      throw error;
    }
  }
  
  /**
   * Delete an activity by its ID
   * @param id The activity ID
   * @returns A promise that resolves to true if the activity was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      const activityRef = doc(db, ACTIVITIES_COLLECTION, id);
      await deleteDoc(activityRef);
      console.log(`Activity ${id} deleted successfully.`);
      return true;
    } catch (error) {
      console.error("❌ Error deleting activity:", error);
      return false;
    }
  }
  
  /**
   * Save an activity offline when the user is not connected to the internet
   * @param activity The activity to save offline
   * @returns A promise that resolves to true if the activity was saved offline, false otherwise
   */
  async saveOffline(activity: Activity): Promise<boolean> {
    try {
      console.log("📴 Offline - Saving activity to IndexedDB:", activity);
      await saveActivityOffline(activity.toObject());
      return true;
    } catch (error) {
      console.error("❌ Error saving activity offline:", error);
      return false;
    }
  }
  
  /**
   * Sync offline activities to the server when the user is back online
   * @returns A promise that resolves to true if the sync was successful, false otherwise
   */
  async syncOfflineActivities(): Promise<boolean> {
    if (!navigator.onLine) return false;
    
    try {
      const offlineActivities = await getOfflineActivities();
      if (offlineActivities.length === 0) return true;
      
      console.log("📡 Syncing offline activities to Firestore...");
      
      for (const activityData of offlineActivities) {
        await addDoc(collection(db, ACTIVITIES_COLLECTION), activityData);
      }
      
      await clearOfflineActivities();
      console.log("✅ Offline activities synced!");
      
      // 🔥 Notify Dashboard to refresh
      window.dispatchEvent(new Event("activitiesUpdated"));
      
      return true;
    } catch (error) {
      console.error("❌ Error syncing offline activities:", error);
      return false;
    }
  }
}

// Create a singleton instance of the repository
export const activityRepository = new FirestoreActivityRepository();

// ✅ Automatically sync when network is restored
window.addEventListener("online", async () => {
  await activityRepository.syncOfflineActivities();
});
