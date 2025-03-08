import { openDB } from "idb";

const DB_NAME = "RinkTrackerDB";
const STORE_NAME = "activities";

// Open or create IndexedDB
const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    }
  },
});

// Add activity to IndexedDB
export const saveActivityOffline = async (activity: any) => {
  const db = await dbPromise;
  
  // Make sure we don't include an undefined id field
  // This is important because IndexedDB will use autoIncrement
  // to generate a unique id for the activity
  const activityToSave = { ...activity };
  if (activityToSave.id === undefined) {
    delete activityToSave.id;
  }
  
  await db.add(STORE_NAME, activityToSave);
};

// Get all offline activities
export const getOfflineActivities = async (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("RinkTrackerDB", 1);
      request.onerror = () => reject("❌ Error opening IndexedDB");
  
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["activities"], "readonly");
        const store = transaction.objectStore("activities");
        const activitiesRequest = store.getAll();
  
        activitiesRequest.onsuccess = () => {
          resolve(activitiesRequest.result || []); // ✅ Ensure we always return an array
        };
  
        activitiesRequest.onerror = () => reject("❌ Error retrieving offline activities");
      };
    });
  };
  

// Clear all offline activities after syncing
export const clearOfflineActivities = async () => {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
};
