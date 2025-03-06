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
  getDoc,
  QueryConstraint,
  DocumentData
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
   * Handle errors in a consistent way
   * @param error The error that occurred
   * @param errorMessage The error message to log
   * @param defaultValue The default value to return
   * @returns The default value
   */
  private handleError<T>(error: unknown, errorMessage: string, defaultValue: T): T {
    console.error(`❌ ${errorMessage}:`, error);
    return defaultValue;
  }
  
  /**
   * Execute a query with error handling
   * @param queryFn The query function to execute
   * @param errorMessage The error message to log if the query fails
   * @param defaultValue The default value to return if the query fails
   * @returns The result of the query or the default value if the query fails
   */
  private async executeQuery<T>(
    queryFn: () => Promise<T>,
    errorMessage: string,
    defaultValue: T
  ): Promise<T> {
    try {
      return await queryFn();
    } catch (error) {
      return this.handleError(error, errorMessage, defaultValue);
    }
  }
  
  /**
   * Map a Firestore document to an Activity
   * @param docId The document ID
   * @param data The document data
   * @returns The Activity
   */
  private mapDocumentToActivity(docId: string, data: DocumentData): Activity {
    return Activity.fromFirestore(docId, data);
  }
  
  /**
   * Find activities by query constraints
   * @param constraints The query constraints
   * @param errorMessage The error message to log if the query fails
   * @returns A promise that resolves to an array of activities
   */
  private async findActivitiesByConstraints(
    constraints: QueryConstraint[],
    errorMessage: string
  ): Promise<Activity[]> {
    return this.executeQuery(
      async () => {
        const q = query(
          collection(db, ACTIVITIES_COLLECTION),
          ...constraints
        );
        
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => 
          this.mapDocumentToActivity(doc.id, doc.data())
        );
      },
      errorMessage,
      []
    );
  }
  /**
   * Get an activity by ID with error handling
   * @param activityId The activity ID
   * @param errorMessage The error message to log if the operation fails
   * @returns A promise that resolves to the activity or null if not found
   */
  private async getActivityById(
    activityId: string,
    errorMessage: string
  ): Promise<Activity | null> {
    return this.executeQuery(
      async () => {
        const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
        const activityDoc = await getDoc(activityRef);
        
        if (!activityDoc.exists()) {
          return null;
        }
        
        return this.mapDocumentToActivity(activityId, activityDoc.data());
      },
      errorMessage,
      null
    );
  }

  /**
   * Find an activity by its ID
   * @param id The activity ID
   * @returns A promise that resolves to the activity or null if not found
   */
  async findById(id: string): Promise<Activity | null> {
    return this.getActivityById(id, "Error finding activity by ID");
  }
  
  /**
   * Find all activities
   * @returns A promise that resolves to an array of activities
   */
  async findAll(): Promise<Activity[]> {
    return this.findActivitiesByConstraints(
      [orderBy("date", "desc")],
      "Error finding all activities"
    );
  }
  
  /**
   * Find activities by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of activities
   */
  async findByUserId(userId: string): Promise<Activity[]> {
    console.log("📡 Fetching activities for user:", userId);
    
    const activities = await this.findActivitiesByConstraints(
      [
        where("userId", "==", userId),
        orderBy("date", "desc")
      ],
      "Error finding activities by user ID"
    );
    
    if (activities.length === 0) {
      console.warn("⚠️ No activities found for user:", userId);
    } else {
      console.log("✅ Activities retrieved from Firestore:", activities.length);
    }
    
    return activities;
  }
  
  /**
   * Find activities by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  async findByRinkId(rinkId: string): Promise<Activity[]> {
    return this.findActivitiesByConstraints(
      [
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      ],
      "Error finding activities by rink ID"
    );
  }
  
  /**
   * Find activities by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  async findByUserIdAndRinkId(userId: string, rinkId: string): Promise<Activity[]> {
    return this.findActivitiesByConstraints(
      [
        where("userId", "==", userId),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      ],
      "Error finding activities by user ID and rink ID"
    );
  }
  
  /**
   * Save an activity (create or update)
   * @param activity The activity to save
   * @returns A promise that resolves to the saved activity
   */
  async save(activity: Activity): Promise<Activity> {
    if (!navigator.onLine) {
      // Save offline
      await this.saveOffline(activity);
      return activity;
    }
    
    return this.executeQuery(
      async () => {
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
      },
      "Error saving activity",
      activity
    );
  }
  
  /**
   * Delete an activity by its ID
   * @param id The activity ID
   * @returns A promise that resolves to true if the activity was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const activityRef = doc(db, ACTIVITIES_COLLECTION, id);
        await deleteDoc(activityRef);
        console.log(`Activity ${id} deleted successfully.`);
        return true;
      },
      "Error deleting activity",
      false
    );
  }
  
  /**
   * Save an activity offline when the user is not connected to the internet
   * @param activity The activity to save offline
   * @returns A promise that resolves to true if the activity was saved offline, false otherwise
   */
  async saveOffline(activity: Activity): Promise<boolean> {
    return this.executeQuery(
      async () => {
        console.log("📴 Offline - Saving activity to IndexedDB:", activity);
        await saveActivityOffline(activity.toObject());
        return true;
      },
      "Error saving activity offline",
      false
    );
  }
  
  /**
   * Sync offline activities to the server when the user is back online
   * @returns A promise that resolves to true if the sync was successful, false otherwise
   */
  async syncOfflineActivities(): Promise<boolean> {
    if (!navigator.onLine) return false;
    
    return this.executeQuery(
      async () => {
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
      },
      "Error syncing offline activities",
      false
    );
  }
}

// Create a singleton instance of the repository
export const activityRepository = new FirestoreActivityRepository();

// ✅ Automatically sync when network is restored
window.addEventListener("online", async () => {
  await activityRepository.syncOfflineActivities();
});
