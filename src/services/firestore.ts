import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";

const ACTIVITIES_COLLECTION = "activities";

// Add a new activity log
export const addActivity = async (userId: string, type: string, details: string) => {
  try {
    await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      userId,
      type,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding activity:", error);
  }
};

// Get user activities
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

// Edit an activity
export const editActivity = async (activityId: string, updatedType: string, updatedDetails: string) => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, {
      type: updatedType,
      details: updatedDetails,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
  }
};

// Delete an activity
export const deleteActivity = async (activityId: string) => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await deleteDoc(activityRef);
  } catch (error) {
    console.error("Error deleting activity:", error);
  }
};
