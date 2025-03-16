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
  increment,
  limit,
  orderBy
} from "firebase/firestore";
import { UserRink } from "../models/UserRink";
import { UserRinkRepository } from "./UserRinkRepository";
import { PaginationOptions, Page } from "./Repository";
import type { Rink } from "../../services/places";

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
   * Find multiple user rinks by their IDs
   * @param ids The user rink IDs
   * @returns A promise that resolves to an array of user rinks
   */
  async findByIds(ids: string[]): Promise<UserRink[]> {
    if (!ids.length) return [];
    
    try {
      // Firestore doesn't support a direct "in" query for document IDs
      // So we need to fetch each document individually
      const fetchPromises = ids.map(id => this.findById(id));
      const userRinks = await Promise.all(fetchPromises);
      
      // Filter out null results
      return userRinks.filter((userRink): userRink is UserRink => userRink !== null);
    } catch (error) {
      console.error("❌ Error finding user rinks by IDs:", error);
      return [];
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
   * Find all user rinks with pagination
   * @param options The pagination options
   * @returns A promise that resolves to a page of user rinks
   */
  async findAllPaginated(options: PaginationOptions): Promise<Page<UserRink>> {
    try {
      const { page, pageSize } = options;
      
      // First, get the total count of user rinks
      const countQuery = query(collection(db, USER_RINKS_COLLECTION));
      const countSnapshot = await getDocs(countQuery);
      const totalItems = countSnapshot.size;
      
      // Calculate total pages
      const totalPages = Math.ceil(totalItems / pageSize);
      
      // Then, get the paginated user rinks
      const q = query(
        collection(db, USER_RINKS_COLLECTION),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      
      const userRinks = snapshot.docs.map(doc => 
        UserRink.fromFirestore(doc.id, doc.data())
      );
      
      // Fetch rink data for each user rink
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
      
      // Create the pagination result
      const result: Page<UserRink> = {
        items: userRinks,
        totalItems,
        currentPage: page,
        pageSize,
        totalPages,
        hasPrevious: page > 1,
        hasNext: page < totalPages
      };
      
      return result;
    } catch (error) {
      console.error("❌ Error finding paginated user rinks:", error);
      return {
        items: [],
        totalItems: 0,
        currentPage: options.page,
        pageSize: options.pageSize,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false
      };
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
   * Check if a user has a verified visit at a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to true if the user has a verified visit at the rink, false otherwise
   */
  async hasUserVerifiedVisit(userId: string, rinkId: string): Promise<boolean> {
    try {
      const userRinkId = `${userId}_${rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
      const userRinkDoc = await getDoc(userRinkRef);
      
      if (!userRinkDoc.exists()) {
        return false;
      }
      
      const data = userRinkDoc.data();
      return data.hasVerifiedVisit === true;
    } catch (error) {
      console.error("❌ Error checking if user has verified visit at rink:", error);
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
   * Save multiple user rinks in a batch operation
   * @param entities The user rinks to save
   * @returns A promise that resolves to the saved user rinks
   */
  async saveAll(entities: UserRink[]): Promise<UserRink[]> {
    if (!entities.length) return [];
    
    try {
      const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
      const savedUserRinks: UserRink[] = [];
      
      // Process each user rink
      for (const userRink of entities) {
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
          } else {
            // Update the rink info in case anything has changed
            await updateDoc(rinkRef, rinkData);
          }
        }
        
        // Add user rink to batch
        const userRinkData = userRink.toObject();
        batch.set(userRinkRef, userRinkData, { merge: true });
        
        // Update ID and add to result
        userRink.id = userRinkId;
        savedUserRinks.push(userRink);
      }
      
      // Commit the batch
      await batch.commit();
      console.log(`✅ Batch saved ${entities.length} user rinks`);
      
      return savedUserRinks;
    } catch (error) {
      console.error("❌ Error saving user rinks in batch:", error);
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
   * Delete multiple user rinks by their IDs
   * @param ids The user rink IDs
   * @returns A promise that resolves to true if all user rinks were deleted, false otherwise
   */
  async deleteAll(ids: string[]): Promise<boolean> {
    if (!ids.length) return true;
    
    try {
      const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
      
      // Add delete operations to batch
      for (const id of ids) {
        const userRinkRef = doc(db, USER_RINKS_COLLECTION, id);
        batch.delete(userRinkRef);
      }
      
      // Commit the batch
      await batch.commit();
      console.log(`✅ Batch deleted ${ids.length} user rinks`);
      
      return true;
    } catch (error) {
      console.error("❌ Error deleting user rinks in batch:", error);
      return false;
    }
  }
  
  /**
   * Increment the visit count for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @param rink Optional rink data
   * @param isVerified Whether this visit is verified (user is at the rink)
   * @returns A promise that resolves to the updated user rink
   */
  async incrementVisitCount(userId: string, rinkId: string, rink?: Rink, isVerified: boolean = false): Promise<UserRink> {
    try {
      const userRinkId = `${userId}_${rinkId}`;
      const userRinkRef = doc(db, USER_RINKS_COLLECTION, userRinkId);
      const userRinkDoc = await getDoc(userRinkRef);
      
      const now = new Date();
      
      if (!userRinkDoc.exists()) {
        // First visit to this rink
        const userRink = UserRink.create(userId, rinkId, rink);
        userRink.incrementVisitCount(now);
        
        // If this is a verified visit, mark it as such
        if (isVerified) {
          userRink.markAsVerified();
          console.log("✅ First visit to rink is verified!");
        }
        
        await this.save(userRink);
        console.log("✅ First visit to rink recorded for user");
        return userRink;
      } else {
        // Get existing user rink data
        const userRinkData = userRinkDoc.data();
        
        // Prepare update data
        const updateData: Record<string, any> = {
          visitCount: increment(1),
          lastVisitDate: now.toISOString(),
          updatedAt: now.toISOString()
        };
        
        // If this is a verified visit and the user doesn't already have a verified visit, mark it
        if (isVerified && !userRinkData.hasVerifiedVisit) {
          updateData.hasVerifiedVisit = true;
          console.log("✅ Visit is verified!");
        }
        
        // Update the user rink
        await updateDoc(userRinkRef, updateData);
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
