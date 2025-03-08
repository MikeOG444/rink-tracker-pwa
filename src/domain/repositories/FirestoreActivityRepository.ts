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
  limit,
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { Activity } from "../models/Activity";
import { ActivityRepository } from "./ActivityRepository";
import { PaginationOptions, Page } from "./Repository";
import { saveActivityOffline, getOfflineActivities, clearOfflineActivities } from "../../services/indexedDB";

const ACTIVITIES_COLLECTION = "activities";
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Check if a cache entry is expired
 * @param entry The cache entry to check
 * @returns True if the entry is expired, false otherwise
 */
function isCacheExpired<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return true;
  return Date.now() - entry.timestamp > CACHE_EXPIRATION_MS;
}

/**
 * Firestore implementation of the ActivityRepository interface
 */
export class FirestoreActivityRepository implements ActivityRepository {
  // Cache for activities by ID
  private activityCache: Map<string, CacheEntry<Activity>> = new Map();
  
  // Cache for activities by user ID
  private userActivitiesCache: Map<string, CacheEntry<Activity[]>> = new Map();
  
  // Cache for activities by rink ID
  private rinkActivitiesCache: Map<string, CacheEntry<Activity[]>> = new Map();
  
  // Cache for activities by user ID and rink ID
  private userRinkActivitiesCache: Map<string, CacheEntry<Activity[]>> = new Map();
  
  /**
   * Add an activity to the cache
   * @param activity The activity to cache
   */
  private cacheActivity(activity: Activity): void {
    if (!activity.id) return;
    
    this.activityCache.set(activity.id, {
      data: activity,
      timestamp: Date.now()
    });
    
    // Invalidate user and rink caches since they might be affected
    this.userActivitiesCache.delete(activity.userId);
    this.rinkActivitiesCache.delete(activity.rinkId);
    this.userRinkActivitiesCache.delete(`${activity.userId}:${activity.rinkId}`);
  }
  
  /**
   * Add activities to the user cache
   * @param userId The user ID
   * @param activities The activities to cache
   */
  private cacheUserActivities(userId: string, activities: Activity[]): void {
    this.userActivitiesCache.set(userId, {
      data: activities,
      timestamp: Date.now()
    });
    
    // Also cache individual activities
    activities.forEach(activity => {
      if (activity.id) {
        this.activityCache.set(activity.id, {
          data: activity,
          timestamp: Date.now()
        });
      }
    });
  }
  
  /**
   * Add activities to the rink cache
   * @param rinkId The rink ID
   * @param activities The activities to cache
   */
  private cacheRinkActivities(rinkId: string, activities: Activity[]): void {
    this.rinkActivitiesCache.set(rinkId, {
      data: activities,
      timestamp: Date.now()
    });
    
    // Also cache individual activities
    activities.forEach(activity => {
      if (activity.id) {
        this.activityCache.set(activity.id, {
          data: activity,
          timestamp: Date.now()
        });
      }
    });
  }
  
  /**
   * Add activities to the user-rink cache
   * @param userId The user ID
   * @param rinkId The rink ID
   * @param activities The activities to cache
   */
  private cacheUserRinkActivities(userId: string, rinkId: string, activities: Activity[]): void {
    this.userRinkActivitiesCache.set(`${userId}:${rinkId}`, {
      data: activities,
      timestamp: Date.now()
    });
    
    // Also cache individual activities
    activities.forEach(activity => {
      if (activity.id) {
        this.activityCache.set(activity.id, {
          data: activity,
          timestamp: Date.now()
        });
      }
    });
  }
  
  /**
   * Invalidate all caches
   */
  private invalidateAllCaches(): void {
    this.activityCache.clear();
    this.userActivitiesCache.clear();
    this.rinkActivitiesCache.clear();
    this.userRinkActivitiesCache.clear();
  }
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
    // Check cache first
    const cachedActivity = this.activityCache.get(id);
    if (cachedActivity && !isCacheExpired(cachedActivity)) {
      console.log(`🔄 Using cached activity: ${id}`);
      return cachedActivity.data;
    }
    
    // Cache miss or expired, fetch from Firestore
    const activity = await this.getActivityById(id, "Error finding activity by ID");
    
    // Cache the result if found
    if (activity) {
      this.cacheActivity(activity);
    }
    
    return activity;
  }
  
  /**
   * Find multiple activities by their IDs
   * @param ids The activity IDs
   * @returns A promise that resolves to an array of activities
   */
  async findByIds(ids: string[]): Promise<Activity[]> {
    if (!ids.length) return [];
    
    // Check cache first for all IDs
    const cachedActivities: Activity[] = [];
    const missingIds: string[] = [];
    
    ids.forEach(id => {
      const cachedActivity = this.activityCache.get(id);
      if (cachedActivity && !isCacheExpired(cachedActivity)) {
        cachedActivities.push(cachedActivity.data);
      } else {
        missingIds.push(id);
      }
    });
    
    // If all activities were found in cache, return them
    if (missingIds.length === 0) {
      console.log(`🔄 Using cached activities for all ${ids.length} IDs`);
      return cachedActivities;
    }
    
    // Fetch missing activities from Firestore
    console.log(`📡 Fetching ${missingIds.length} activities from Firestore`);
    
    return this.executeQuery(
      async () => {
        // Firestore doesn't support a direct "in" query for document IDs
        // So we need to fetch each document individually
        const fetchPromises = missingIds.map(id => 
          this.getActivityById(id, `Error finding activity with ID ${id}`)
        );
        
        const fetchedActivities = await Promise.all(fetchPromises);
        
        // Filter out null results and cache the fetched activities
        const validActivities = fetchedActivities.filter((activity): activity is Activity => 
          activity !== null
        );
        
        validActivities.forEach(activity => {
          this.cacheActivity(activity);
        });
        
        // Combine cached and fetched activities
        return [...cachedActivities, ...validActivities];
      },
      "Error finding activities by IDs",
      cachedActivities // Return cached activities if the query fails
    );
  }
  
  /**
   * Find all activities
   * @returns A promise that resolves to an array of activities
   */
  async findAll(): Promise<Activity[]> {
    // No caching for findAll as it could be a large dataset
    return this.findActivitiesByConstraints(
      [orderBy("date", "desc")],
      "Error finding all activities"
    );
  }
  
  /**
   * Find all activities with pagination
   * @param options The pagination options
   * @returns A promise that resolves to a page of activities
   */
  async findAllPaginated(options: PaginationOptions): Promise<Page<Activity>> {
    return this.executeQuery(
      async () => {
        const { page, pageSize } = options;
        
        // First, get the total count of activities
        const countQuery = query(collection(db, ACTIVITIES_COLLECTION));
        const countSnapshot = await getDocs(countQuery);
        const totalItems = countSnapshot.size;
        
        // Calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);
        
        // Then, get the paginated activities
        const q = query(
          collection(db, ACTIVITIES_COLLECTION),
          orderBy("date", "desc"),
          limit(pageSize)
        );
        
        const snapshot = await getDocs(q);
        
        const activities = snapshot.docs.map(doc => 
          this.mapDocumentToActivity(doc.id, doc.data())
        );
        
        // Create the pagination result
        const result: Page<Activity> = {
          items: activities,
          totalItems,
          currentPage: page,
          pageSize,
          totalPages,
          hasPrevious: page > 1,
          hasNext: page < totalPages
        };
        
        return result;
      },
      "Error finding paginated activities",
      {
        items: [],
        totalItems: 0,
        currentPage: options.page,
        pageSize: options.pageSize,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false
      }
    );
  }
  
  /**
   * Find activities by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of activities
   */
  async findByUserId(userId: string): Promise<Activity[]> {
    console.log("📡 Fetching activities for user:", userId);
    
    // Check cache first
    const cachedActivities = this.userActivitiesCache.get(userId);
    if (cachedActivities && !isCacheExpired(cachedActivities)) {
      console.log(`🔄 Using cached activities for user: ${userId}`);
      return cachedActivities.data;
    }
    
    // Cache miss or expired, fetch from Firestore
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
      
      // Cache the results
      this.cacheUserActivities(userId, activities);
    }
    
    return activities;
  }
  
  /**
   * Find activities by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  async findByRinkId(rinkId: string): Promise<Activity[]> {
    // Check cache first
    const cachedActivities = this.rinkActivitiesCache.get(rinkId);
    if (cachedActivities && !isCacheExpired(cachedActivities)) {
      console.log(`🔄 Using cached activities for rink: ${rinkId}`);
      return cachedActivities.data;
    }
    
    // Cache miss or expired, fetch from Firestore
    const activities = await this.findActivitiesByConstraints(
      [
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      ],
      "Error finding activities by rink ID"
    );
    
    // Cache the results
    if (activities.length > 0) {
      this.cacheRinkActivities(rinkId, activities);
    }
    
    return activities;
  }
  
  /**
   * Find activities by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  async findByUserIdAndRinkId(userId: string, rinkId: string): Promise<Activity[]> {
    // Check cache first
    const cacheKey = `${userId}:${rinkId}`;
    const cachedActivities = this.userRinkActivitiesCache.get(cacheKey);
    if (cachedActivities && !isCacheExpired(cachedActivities)) {
      console.log(`🔄 Using cached activities for user: ${userId} and rink: ${rinkId}`);
      return cachedActivities.data;
    }
    
    // Cache miss or expired, fetch from Firestore
    const activities = await this.findActivitiesByConstraints(
      [
        where("userId", "==", userId),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      ],
      "Error finding activities by user ID and rink ID"
    );
    
    // Cache the results
    if (activities.length > 0) {
      this.cacheUserRinkActivities(userId, rinkId, activities);
    }
    
    return activities;
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
        
        // Update cache
        this.cacheActivity(activity);
        
        // Invalidate user activities cache since it's now outdated
        this.userActivitiesCache.delete(activity.userId);
        
        return activity;
      },
      "Error saving activity",
      activity
    );
  }
  
  /**
   * Save multiple activities in a batch operation
   * @param entities The activities to save
   * @returns A promise that resolves to the saved activities
   */
  async saveAll(entities: Activity[]): Promise<Activity[]> {
    if (!entities.length) return [];
    
    if (!navigator.onLine) {
      // Save all activities offline
      const results = await Promise.all(
        entities.map(activity => this.saveOffline(activity))
      );
      
      // Check if all activities were saved successfully
      const allSaved = results.every(result => result);
      if (!allSaved) {
        console.error("❌ Some activities could not be saved offline");
      }
      
      return entities;
    }
    
    return this.executeQuery(
      async () => {
        const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
        const savedActivities: Activity[] = [];
        
        // Group activities by whether they have an ID or not
        const existingActivities = entities.filter(activity => activity.id);
        const newActivities = entities.filter(activity => !activity.id);
        
        // Update existing activities
        for (const activity of existingActivities) {
          const activityRef = doc(db, ACTIVITIES_COLLECTION, activity.id!);
          batch.update(activityRef, activity.toObject());
          savedActivities.push(activity);
        }
        
        // Create new activities
        const newActivityRefs: { activity: Activity; ref: ReturnType<typeof doc> }[] = [];
        
        for (const activity of newActivities) {
          const newRef = doc(collection(db, ACTIVITIES_COLLECTION));
          // Use the updated toObject method which now correctly handles undefined id
          batch.set(newRef, activity.toObject());
          newActivityRefs.push({ activity, ref: newRef });
        }
        
        // Commit the batch
        await batch.commit();
        console.log(`✅ Batch saved ${entities.length} activities`);
        
        // Update IDs for new activities
        for (const { activity, ref } of newActivityRefs) {
          activity.id = ref.id;
          savedActivities.push(activity);
        }
        
        // Update cache for all activities
        savedActivities.forEach(activity => {
          this.cacheActivity(activity);
        });
        
        // Invalidate user activities caches
        const userIds = new Set(savedActivities.map(activity => activity.userId));
        userIds.forEach(userId => {
          this.userActivitiesCache.delete(userId);
        });
        
        return savedActivities;
      },
      "Error saving activities in batch",
      []
    );
  }
  
  /**
   * Delete an activity by its ID
   * @param id The activity ID
   * @returns A promise that resolves to true if the activity was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    // Get the activity from cache or Firestore before deleting
    const activity = await this.findById(id);
    
    return this.executeQuery(
      async () => {
        const activityRef = doc(db, ACTIVITIES_COLLECTION, id);
        await deleteDoc(activityRef);
        console.log(`Activity ${id} deleted successfully.`);
        
        // Remove from cache
        this.activityCache.delete(id);
        
        // Invalidate related caches
        if (activity) {
          this.userActivitiesCache.delete(activity.userId);
          this.rinkActivitiesCache.delete(activity.rinkId);
          this.userRinkActivitiesCache.delete(`${activity.userId}:${activity.rinkId}`);
        }
        
        return true;
      },
      "Error deleting activity",
      false
    );
  }
  
  /**
   * Delete multiple activities by their IDs
   * @param ids The activity IDs
   * @returns A promise that resolves to true if all activities were deleted, false otherwise
   */
  async deleteAll(ids: string[]): Promise<boolean> {
    if (!ids.length) return true;
    
    // Get activities from cache or Firestore before deleting
    const activities = await this.findByIds(ids);
    
    return this.executeQuery(
      async () => {
        const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
        
        // Add delete operations to batch
        for (const id of ids) {
          const activityRef = doc(db, ACTIVITIES_COLLECTION, id);
          batch.delete(activityRef);
        }
        
        // Commit the batch
        await batch.commit();
        console.log(`✅ Batch deleted ${ids.length} activities`);
        
        // Remove from cache
        ids.forEach(id => {
          this.activityCache.delete(id);
        });
        
        // Collect unique user IDs and rink IDs for cache invalidation
        const userIds = new Set<string>();
        const rinkIds = new Set<string>();
        const userRinkPairs = new Set<string>();
        
        activities.forEach(activity => {
          userIds.add(activity.userId);
          rinkIds.add(activity.rinkId);
          userRinkPairs.add(`${activity.userId}:${activity.rinkId}`);
        });
        
        // Invalidate related caches
        userIds.forEach(userId => {
          this.userActivitiesCache.delete(userId);
        });
        
        rinkIds.forEach(rinkId => {
          this.rinkActivitiesCache.delete(rinkId);
        });
        
        userRinkPairs.forEach(pair => {
          this.userRinkActivitiesCache.delete(pair);
        });
        
        return true;
      },
      "Error deleting activities in batch",
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
        
        // Track affected user IDs for cache invalidation
        const affectedUserIds = new Set<string>();
        
        for (const activityData of offlineActivities) {
          // Make sure we don't include an undefined id field
          // when adding to Firestore
          const activityToSave = { ...activityData };
          if (activityToSave.id === undefined) {
            delete activityToSave.id;
          }
          
          const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), activityToSave);
          console.log(`✅ Synced offline activity with ID: ${docRef.id}`);
          
          // Track the user ID for cache invalidation
          if (activityData.userId) {
            affectedUserIds.add(activityData.userId);
          }
        }
        
        await clearOfflineActivities();
        console.log("✅ Offline activities synced!");
        
        // Invalidate all caches to ensure data consistency
        this.invalidateAllCaches();
        
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
