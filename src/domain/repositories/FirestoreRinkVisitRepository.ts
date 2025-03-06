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
  setDoc,
  limit
} from "firebase/firestore";
import { RinkVisit } from "../models/RinkVisit";
import { RinkVisitRepository } from "./RinkVisitRepository";
import ActivityType from "../models/ActivityType";
import type { Rink } from "../../services/places";

const RINK_VISITS_COLLECTION = "rink_visits";
const RINKS_COLLECTION = "rinks";

/**
 * Firestore implementation of the RinkVisitRepository interface
 */
export class FirestoreRinkVisitRepository implements RinkVisitRepository {
  /**
   * Find a visit by its ID
   * @param id The visit ID
   * @returns A promise that resolves to the visit or null if not found
   */
  async findById(id: string): Promise<RinkVisit | null> {
    try {
      const visitRef = doc(db, RINK_VISITS_COLLECTION, id);
      const visitDoc = await getDoc(visitRef);
      
      if (!visitDoc.exists()) {
        return null;
      }
      
      const visit = RinkVisit.fromFirestore(id, visitDoc.data());
      
      // Fetch the rink details if available
      if (visit.rinkId) {
        const rinkRef = doc(db, RINKS_COLLECTION, visit.rinkId);
        const rinkDoc = await getDoc(rinkRef);
        
        if (rinkDoc.exists()) {
          const rinkData = rinkDoc.data();
          visit.rinkData = {
            id: rinkData.id as string,
            name: rinkData.name as string,
            address: rinkData.address as string,
            position: rinkData.position as { lat: number, lng: number },
            photo: rinkData.photo as string,
            rating: rinkData.rating as number
          };
        }
      }
      
      return visit;
    } catch (error) {
      console.error("❌ Error finding visit by ID:", error);
      return null;
    }
  }
  
  /**
   * Find all visits
   * @returns A promise that resolves to an array of visits
   */
  async findAll(): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding all visits:", error);
      return [];
    }
  }
  
  /**
   * Find visits by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of visits
   */
  async findByUserId(userId: string): Promise<RinkVisit[]> {
    try {
      console.log("📡 Fetching visits for user:", userId);
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.warn("⚠️ No visits found for user:", userId);
        return [];
      }
      
      const visits = await Promise.all(snapshot.docs.map(async docSnapshot => {
        const visit = RinkVisit.fromFirestore(docSnapshot.id, docSnapshot.data());
        
        // Fetch the rink details if available
        if (visit.rinkId) {
          const rinkRef = doc(db, RINKS_COLLECTION, visit.rinkId);
          const rinkDoc = await getDoc(rinkRef);
          
          if (rinkDoc.exists()) {
            const rinkData = rinkDoc.data();
            visit.rinkData = {
              id: rinkData.id as string,
              name: rinkData.name as string,
              address: rinkData.address as string,
              position: rinkData.position as { lat: number, lng: number },
              photo: rinkData.photo as string,
              rating: rinkData.rating as number
            };
          }
        }
        
        return visit;
      }));
      
      console.log("✅ Visits retrieved from Firestore:", visits.length);
      
      return visits;
    } catch (error) {
      console.error("❌ Error finding visits by user ID:", error);
      return [];
    }
  }
  
  /**
   * Find visits by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of visits
   */
  async findByRinkId(rinkId: string): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding visits by rink ID:", error);
      return [];
    }
  }
  
  /**
   * Find visits by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of visits
   */
  async findByUserIdAndRinkId(userId: string, rinkId: string): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("userId", "==", userId),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding visits by user ID and rink ID:", error);
      return [];
    }
  }
  
  /**
   * Find visits by activity type
   * @param activityType The activity type
   * @returns A promise that resolves to an array of visits
   */
  async findByActivityType(activityType: ActivityType): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("activityType", "==", activityType),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding visits by activity type:", error);
      return [];
    }
  }
  
  /**
   * Find visits by user ID and activity type
   * @param userId The user ID
   * @param activityType The activity type
   * @returns A promise that resolves to an array of visits
   */
  async findByUserIdAndActivityType(userId: string, activityType: ActivityType): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("userId", "==", userId),
        where("activityType", "==", activityType),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding visits by user ID and activity type:", error);
      return [];
    }
  }
  
  /**
   * Find public visits
   * @returns A promise that resolves to an array of public visits
   */
  async findPublicVisits(): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("isPublic", "==", true),
        orderBy("date", "desc"),
        limit(50) // Limit to 50 most recent public visits
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding public visits:", error);
      return [];
    }
  }
  
  /**
   * Find public visits by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of public visits
   */
  async findPublicVisitsByUserId(userId: string): Promise<RinkVisit[]> {
    try {
      const q = query(
        collection(db, RINK_VISITS_COLLECTION),
        where("userId", "==", userId),
        where("isPublic", "==", true),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        RinkVisit.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error("❌ Error finding public visits by user ID:", error);
      return [];
    }
  }
  
  /**
   * Save a visit (create or update)
   * @param visit The visit to save
   * @returns A promise that resolves to the saved visit
   */
  async save(visit: RinkVisit): Promise<RinkVisit> {
    try {
      // Save the rink data if provided
      if (visit.rinkData) {
        const rinkRef = doc(db, RINKS_COLLECTION, visit.rinkId);
        const rinkDoc = await getDoc(rinkRef);
        
        const rinkData = {
          id: visit.rinkId,
          name: visit.rinkData.name,
          address: visit.rinkData.address,
          position: visit.rinkData.position,
          photo: visit.rinkData.photo,
          rating: visit.rinkData.rating,
          updatedAt: new Date().toISOString()
        };
        
        if (!rinkDoc.exists()) {
          // Save basic rink info to the global rinks collection
          await setDoc(rinkRef, {
            ...rinkData,
            createdAt: new Date().toISOString()
          });
          console.log("✅ Rink added to global collection:", visit.rinkData.name);
        } else {
          // Update the rink info in case anything has changed
          await updateDoc(rinkRef, rinkData);
          console.log("✅ Rink updated in global collection:", visit.rinkData.name);
        }
      }
      
      const visitData = visit.toObject();
      
      if (visit.id) {
        // Update existing visit
        const visitRef = doc(db, RINK_VISITS_COLLECTION, visit.id);
        await updateDoc(visitRef, visitData);
        console.log("✅ Visit updated in Firestore:", visit.id);
      } else {
        // Create new visit
        const docRef = await addDoc(collection(db, RINK_VISITS_COLLECTION), visitData);
        visit.id = docRef.id;
        console.log("✅ Visit added to Firestore with ID:", docRef.id);
      }
      
      return visit;
    } catch (error) {
      console.error("❌ Error saving visit:", error);
      throw error;
    }
  }
  
  /**
   * Delete a visit by its ID
   * @param id The visit ID
   * @returns A promise that resolves to true if the visit was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      const visitRef = doc(db, RINK_VISITS_COLLECTION, id);
      await deleteDoc(visitRef);
      console.log(`Visit ${id} deleted successfully.`);
      return true;
    } catch (error) {
      console.error("❌ Error deleting visit:", error);
      return false;
    }
  }
  
  /**
   * Add a photo to a visit
   * @param visitId The visit ID
   * @param photoUrl The photo URL
   * @returns A promise that resolves to the updated visit
   */
  async addPhoto(visitId: string, photoUrl: string): Promise<RinkVisit> {
    try {
      const visit = await this.findById(visitId);
      
      if (!visit) {
        throw new Error(`Visit not found with ID: ${visitId}`);
      }
      
      visit.addPhoto(photoUrl);
      return this.save(visit);
    } catch (error) {
      console.error("❌ Error adding photo to visit:", error);
      throw error;
    }
  }
  
  /**
   * Remove a photo from a visit
   * @param visitId The visit ID
   * @param photoUrl The photo URL
   * @returns A promise that resolves to the updated visit
   */
  async removePhoto(visitId: string, photoUrl: string): Promise<RinkVisit> {
    try {
      const visit = await this.findById(visitId);
      
      if (!visit) {
        throw new Error(`Visit not found with ID: ${visitId}`);
      }
      
      visit.removePhoto(photoUrl);
      return this.save(visit);
    } catch (error) {
      console.error("❌ Error removing photo from visit:", error);
      throw error;
    }
  }
  
  /**
   * Update the rating for a visit
   * @param visitId The visit ID
   * @param rating The rating (1-5)
   * @returns A promise that resolves to the updated visit
   */
  async updateRating(visitId: string, rating: number): Promise<RinkVisit> {
    try {
      const visit = await this.findById(visitId);
      
      if (!visit) {
        throw new Error(`Visit not found with ID: ${visitId}`);
      }
      
      visit.updateRating(rating);
      return this.save(visit);
    } catch (error) {
      console.error("❌ Error updating rating for visit:", error);
      throw error;
    }
  }
  
  /**
   * Toggle the public status of a visit
   * @param visitId The visit ID
   * @returns A promise that resolves to the updated visit
   */
  async togglePublic(visitId: string): Promise<RinkVisit> {
    try {
      const visit = await this.findById(visitId);
      
      if (!visit) {
        throw new Error(`Visit not found with ID: ${visitId}`);
      }
      
      visit.togglePublic();
      return this.save(visit);
    } catch (error) {
      console.error("❌ Error toggling public status for visit:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the repository
export const rinkVisitRepository = new FirestoreRinkVisitRepository();
