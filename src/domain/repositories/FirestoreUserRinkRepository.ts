import { db } from "../../firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  setDoc, 
  increment 
} from "firebase/firestore";
import { UserRink } from "../models/UserRink";
import { UserRinkRepository } from "./UserRinkRepository";
import { Rink } from "../../services/places";

const USER_RINKS_COLLECTION = "user_rinks";
const RINKS_COLLECTION = "rinks";

/**
 * Firestore implementation of the UserRinkRepository interface
 */
export class FirestoreUserRinkRepository implements UserRinkRepository {
  /**
   * Find a user rink by its ID
   * @param id The user rink ID
   * @returns A promise that resolves to the user rink or null if not found
   */
  async findById(id: string): Promise<UserRink | null> {
    try {
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, id);
      const userRinkDoc = await getDoc(userRinkRef);
      
      if (!userRinkDoc.exists()) {
        return null;
      }
      
      return UserRink.fromFirestore(id, userRinkDoc.data());
    } catch (error) {
      console.error("❌ Error finding user rink by ID:", error);
      return null;
    }
  }
  
  /**
   * Find all user rinks
   * @returns A promise that resolves to an array of user rinks
   */
  async findAll(): Promise<UserRink[]> {
    try {
      const q = query(collection(db, USER_RINKS_COLLECTION));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        UserRink.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding all user rinks:", error);
      return [];
    }
  }
  
  /**
   * Find user rinks by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of user rinks
   */
  async findByUserId(userId: string): Promise<UserRink[]> {
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
      
      // Get the user rinks
      const userRinks = snapshot.docs.map(doc => 
        UserRink.fromFirestore(doc.id, doc.data())
      );
      
      // Fetch the actual rink details from the rinks collection
      for (const userRink of userRinks) {
        const rinkRef = doc(db, RINKS_COLLECTION, userRink.rinkId);
        const rinkDoc = await getDoc(rinkRef);
        
        if (rinkDoc.exists()) {
          const rinkData = rinkDoc.data();
          userRink.rinkData = {
            id: rinkData.id,
            name: rinkData.name,
            address: rinkData.address,
            position: rinkData.position,
            photo: rinkData.photo,
            rating: rinkData.rating
          };
        }
      }
      
      console.log("✅ Retrieved", userRinks.length, "visited rinks");
      return userRinks;
    } catch (error) {
      console.error("❌ Error finding user rinks by user ID:", error);
      return [];
    }
  }
  
  /**
   * Find a user rink by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to the user rink or null if not found
   */
  async findByUserIdAndRinkId(userId: string, rinkId: string): Promise<UserRink | null> {
    try {
      const userRinkId = `${userId}_${rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
      const userRinkDoc = await getDoc(userRinkRef);
      
      if (!userRinkDoc.exists()) {
        return null;
      }
      
      const userRink = UserRink.fromFirestore(userRinkId, userRinkDoc.data());
      
      // Fetch the rink details
      const rinkRef = doc(db, RINKS_COLLECTION, rinkId);
      const rinkDoc = await getDoc(rinkRef);
      
      if (rinkDoc.exists()) {
        const rinkData = rinkDoc.data();
        userRink.rinkData = {
          id: rinkData.id,
          name: rinkData.name,
          address: rinkData.address,
          position: rinkData.position,
          photo: rinkData.photo,
          rating: rinkData.rating
        };
      }
      
      return userRink;
    } catch (error) {
      console.error("❌ Error finding user rink by user ID and rink ID:", error);
      return null;
    }
  }
  
  /**
   * Check if a user has visited a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to true if the user has visited the rink, false otherwise
   */
  async hasUserVisitedRink(userId: string, rinkId: string): Promise<boolean> {
    try {
      const userRinkId = `${userId}_${rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
      const userRinkDoc = await getDoc(userRinkRef);
      
      return userRinkDoc.exists();
    } catch (error) {
      console.error("❌ Error checking if user visited rink:", error);
      return false;
    }
  }
  
  /**
   * Get the visit count for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to the visit count
   */
  async getVisitCount(userId: string, rinkId: string): Promise<number> {
    try {
      const userRinkId = `${userId}_${rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
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
  }
  
  /**
   * Save a user rink (create or update)
   * @param userRink The user rink to save
   * @returns A promise that resolves to the saved user rink
   */
  async save(userRink: UserRink): Promise<UserRink> {
    try {
      const userRinkId = userRink.id || `${userRink.userId}_${userRink.rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
      
      // Save the rink data if provided
      if (userRink.rinkData) {
        const rinkRef = doc(db, RINKS_COLLECTION, userRink.rinkId);
        const rinkDoc = await getDoc(rinkRef);
        
        const rinkData = {
          id: userRink.rinkId,
          name: userRink.rinkData.name,
          address: userRink.rinkData.address,
          position: userRink.rinkData.position,
          photo: userRink.rinkData.photo,
          rating: userRink.rinkData.rating,
          updatedAt: new Date().toISOString()
        };
        
        if (!rinkDoc.exists()) {
          // Save basic rink info to the global rinks collection
          await setDoc(rinkRef, {
            ...rinkData,
            createdAt: new Date().toISOString()
          });
          console.log("✅ Rink added to global collection:", userRink.rinkData.name);
        } else {
          // Update the rink info in case anything has changed
          await updateDoc(rinkRef, rinkData);
          console.log("✅ Rink updated in global collection:", userRink.rinkData.name);
        }
      }
      
      // Save the user rink
      const userRinkData = userRink.toObject();
      
      const userRinkDoc = await getDoc(userRinkRef);
      if (userRinkDoc.exists()) {
        await updateDoc(userRinkRef, userRinkData);
        console.log("✅ User rink updated:", userRinkId);
      } else {
        await setDoc(userRinkRef, userRinkData);
        console.log("✅ User rink created:", userRinkId);
      }
      
      userRink.id = userRinkId;
      return userRink;
    } catch (error) {
      console.error("❌ Error saving user rink:", error);
      throw error;
    }
  }
  
  /**
   * Delete a user rink by its ID
   * @param id The user rink ID
   * @returns A promise that resolves to true if the user rink was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, id);
      await deleteDoc(userRinkRef);
      console.log(`User rink ${id} deleted successfully.`);
      return true;
    } catch (error) {
      console.error("❌ Error deleting user rink:", error);
      return false;
    }
  }
  
  /**
   * Increment the visit count for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @param rink Optional rink data
   * @returns A promise that resolves to the updated user rink
   */
  async incrementVisitCount(userId: string, rinkId: string, rink?: Rink): Promise<UserRink> {
    try {
      const userRinkId = `${userId}_${rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
      const userRinkDoc = await getDoc(userRinkRef);
      
      const now = new Date();
      
      if (!userRinkDoc.exists()) {
        // First visit to this rink
        const userRink = UserRink.create(userId, rinkId, rink);
        userRink.incrementVisitCount(now);
        await this.save(userRink);
        console.log("✅ First visit to rink recorded for user");
        return userRink;
      } else {
        // Update visit count and last visit date
        await updateDoc(userRinkRef, {
          visitCount: increment(1),
          lastVisitDate: now.toISOString(),
          updatedAt: now.toISOString()
        });
        console.log("✅ Visit count updated for rink");
        
        // Get the updated user rink
        return this.findByUserIdAndRinkId(userId, rinkId) as Promise<UserRink>;
      }
    } catch (error) {
      console.error("❌ Error incrementing visit count:", error);
      throw error;
    }
  }
  
  /**
   * Toggle the favorite status for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to the updated user rink
   */
  async toggleFavorite(userId: string, rinkId: string): Promise<UserRink> {
    try {
      const userRink = await this.findByUserIdAndRinkId(userId, rinkId);
      
      if (!userRink) {
        throw new Error(`User rink not found for user ${userId} and rink ${rinkId}`);
      }
      
      userRink.toggleFavorite();
      await this.save(userRink);
      
      return userRink;
    } catch (error) {
      console.error("❌ Error toggling favorite status:", error);
      throw error;
    }
  }
  
  /**
   * Update the notes for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @param notes The notes
   * @returns A promise that resolves to the updated user rink
   */
  async updateNotes(userId: string, rinkId: string, notes: string): Promise<UserRink> {
    try {
      const userRink = await this.findByUserIdAndRinkId(userId, rinkId);
      
      if (!userRink) {
        throw new Error(`User rink not found for user ${userId} and rink ${rinkId}`);
      }
      
      userRink.updateNotes(notes);
      await this.save(userRink);
      
      return userRink;
    } catch (error) {
      console.error("❌ Error updating notes:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the repository
export const userRinkRepository = new FirestoreUserRinkRepository();
