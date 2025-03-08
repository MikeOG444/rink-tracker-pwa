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
  limit,
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { RinkVisit } from "../models/RinkVisit";
import { RinkVisitRepository } from "./RinkVisitRepository";
import { PaginationOptions, Page } from "./Repository";
import ActivityType from "../models/ActivityType";
import type { Rink } from "../../services/places";

const RINK_VISITS_COLLECTION = "rink_visits";
const RINKS_COLLECTION = "rinks";


/**
 * Firestore implementation of the RinkVisitRepository interface
 */
export class FirestoreRinkVisitRepository implements RinkVisitRepository {
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
   * Map a Firestore document to a RinkVisit
   * @param doc The Firestore document
   * @returns The RinkVisit
   */
  private mapDocumentToVisit(docId: string, data: DocumentData): RinkVisit {
    return RinkVisit.fromFirestore(docId, data);
  }
  
  /**
   * Get rink data for a visit
   * @param rinkId The rink ID
   * @returns A promise that resolves to the rink data or null if not found
   */
  private async getRinkData(rinkId: string): Promise<Partial<Rink> | null> {
    try {
      const rinkRef = doc(db, RINKS_COLLECTION, rinkId);
      const rinkDoc = await getDoc(rinkRef);
      
      if (!rinkDoc.exists()) {
        return null;
      }
      
      const rinkData = rinkDoc.data();
      return {
        id: rinkData.id as string,
        name: rinkData.name as string,
        address: rinkData.address as string,
        position: rinkData.position as { lat: number, lng: number },
        photo: rinkData.photo as string,
        rating: rinkData.rating as number
      };
    } catch (error) {
      console.error("❌ Error getting rink data:", error);
      return null;
    }
  }
  
  /**
   * Find visits by query constraints
   * @param constraints The query constraints
   * @param errorMessage The error message to log if the query fails
   * @returns A promise that resolves to an array of visits
   */
  private async findVisitsByConstraints(
    constraints: QueryConstraint[],
    errorMessage: string
  ): Promise<RinkVisit[]> {
    return this.executeQuery(
      async () => {
        const q = query(
          collection(db, RINK_VISITS_COLLECTION),
          ...constraints
        );
        
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => 
          this.mapDocumentToVisit(doc.id, doc.data())
        );
      },
      errorMessage,
      []
    );
  }
  
  /**
   * Get a visit by ID with error handling
   * @param visitId The visit ID
   * @param errorMessage The error message to log if the operation fails
   * @returns A promise that resolves to the visit or null if not found
   */
  private async getVisitById(
    visitId: string,
    errorMessage: string
  ): Promise<RinkVisit | null> {
    return this.executeQuery(
      async () => {
        const visitRef = doc(db, RINK_VISITS_COLLECTION, visitId);
        const visitDoc = await getDoc(visitRef);
        
        if (!visitDoc.exists()) {
          return null;
        }
        
        const visit = this.mapDocumentToVisit(visitId, visitDoc.data());
        
        // Fetch the rink details if available
        if (visit.rinkId) {
          await this.fetchRinkDataForVisits([visit]);
        }
        
        return visit;
      },
      errorMessage,
      null
    );
  }
  
  /**
   * Update a visit with a function and save it
   * @param visitId The visit ID
   * @param updateFn The function to update the visit
   * @param errorMessage The error message to log if the operation fails
   * @returns A promise that resolves to the updated visit
   */
  private async updateVisitAndSave(
    visitId: string,
    updateFn: (visit: RinkVisit) => void,
    errorMessage: string
  ): Promise<RinkVisit> {
    try {
      const visit = await this.findById(visitId);
      
      if (!visit) {
        throw new Error(`Visit not found with ID: ${visitId}`);
      }
      
      updateFn(visit);
      return this.save(visit);
    } catch (error) {
      console.error(`❌ ${errorMessage}:`, error);
      throw error;
    }
  }
  /**
   * Find a visit by its ID
   * @param id The visit ID
   * @returns A promise that resolves to the visit or null if not found
   */
  async findById(id: string): Promise<RinkVisit | null> {
    return this.getVisitById(id, "Error finding visit by ID");
  }
  
  /**
   * Find multiple visits by their IDs
   * @param ids The visit IDs
   * @returns A promise that resolves to an array of visits
   */
  async findByIds(ids: string[]): Promise<RinkVisit[]> {
    if (!ids.length) return [];
    
    return this.executeQuery(
      async () => {
        // Firestore doesn't support a direct "in" query for document IDs
        // So we need to fetch each document individually
        const fetchPromises = ids.map(id => 
          this.getVisitById(id, `Error finding visit with ID ${id}`)
        );
        
        const visits = await Promise.all(fetchPromises);
        
        // Filter out null results
        const validVisits = visits.filter((visit): visit is RinkVisit => 
          visit !== null
        );
        
        // Fetch rink data for each visit
        await this.fetchRinkDataForVisits(validVisits);
        
        return validVisits;
      },
      "Error finding visits by IDs",
      []
    );
  }
  
  /**
   * Find all visits
   * @returns A promise that resolves to an array of visits
   */
  async findAll(): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [orderBy("date", "desc")],
      "Error finding all visits"
    );
  }
  
  /**
   * Find all visits with pagination
   * @param options The pagination options
   * @returns A promise that resolves to a page of visits
   */
  async findAllPaginated(options: PaginationOptions): Promise<Page<RinkVisit>> {
    return this.executeQuery(
      async () => {
        const { page, pageSize } = options;
        
        // First, get the total count of visits
        const countQuery = query(collection(db, RINK_VISITS_COLLECTION));
        const countSnapshot = await getDocs(countQuery);
        const totalItems = countSnapshot.size;
        
        // Calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);
        
        // Then, get the paginated visits
        const q = query(
          collection(db, RINK_VISITS_COLLECTION),
          orderBy("date", "desc"),
          limit(pageSize)
        );
        
        const snapshot = await getDocs(q);
        
        const visits = snapshot.docs.map(doc => 
          this.mapDocumentToVisit(doc.id, doc.data())
        );
        
        // Fetch rink data for each visit
        await this.fetchRinkDataForVisits(visits);
        
        // Create the pagination result
        const result: Page<RinkVisit> = {
          items: visits,
          totalItems,
          currentPage: page,
          pageSize,
          totalPages,
          hasPrevious: page > 1,
          hasNext: page < totalPages
        };
        
        return result;
      },
      "Error finding paginated visits",
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
   * Fetch rink data for a list of visits
   * @param visits The visits to fetch rink data for
   * @returns A promise that resolves when all rink data has been fetched
   */
  private async fetchRinkDataForVisits(visits: RinkVisit[]): Promise<void> {
    for (const visit of visits) {
      if (visit.rinkId) {
        const rinkData = await this.getRinkData(visit.rinkId);
        if (rinkData) {
          visit.rinkData = rinkData as Rink;
        }
      }
    }
  }
  
  /**
   * Find visits by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of visits
   */
  async findByUserId(userId: string): Promise<RinkVisit[]> {
    console.log("📡 Fetching visits for user:", userId);
    
    const visits = await this.findVisitsByConstraints(
      [
        where("userId", "==", userId),
        orderBy("date", "desc")
      ],
      "Error finding visits by user ID"
    );
    
    if (visits.length === 0) {
      console.warn("⚠️ No visits found for user:", userId);
    } else {
      console.log("✅ Visits retrieved from Firestore:", visits.length);
    }
    
    // Fetch rink data for each visit
    await this.fetchRinkDataForVisits(visits);
    
    return visits;
  }
  
  /**
   * Find visits by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of visits
   */
  async findByRinkId(rinkId: string): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      ],
      "Error finding visits by rink ID"
    );
  }
  
  /**
   * Find visits by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of visits
   */
  async findByUserIdAndRinkId(userId: string, rinkId: string): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [
        where("userId", "==", userId),
        where("rinkId", "==", rinkId),
        orderBy("date", "desc")
      ],
      "Error finding visits by user ID and rink ID"
    );
  }
  
  /**
   * Find visits by activity type
   * @param activityType The activity type
   * @returns A promise that resolves to an array of visits
   */
  async findByActivityType(activityType: ActivityType): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [
        where("activityType", "==", activityType),
        orderBy("date", "desc")
      ],
      "Error finding visits by activity type"
    );
  }
  
  /**
   * Find visits by user ID and activity type
   * @param userId The user ID
   * @param activityType The activity type
   * @returns A promise that resolves to an array of visits
   */
  async findByUserIdAndActivityType(userId: string, activityType: ActivityType): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [
        where("userId", "==", userId),
        where("activityType", "==", activityType),
        orderBy("date", "desc")
      ],
      "Error finding visits by user ID and activity type"
    );
  }
  
  /**
   * Find public visits
   * @returns A promise that resolves to an array of public visits
   */
  async findPublicVisits(): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [
        where("isPublic", "==", true),
        orderBy("date", "desc"),
        limit(50) // Limit to 50 most recent public visits
      ],
      "Error finding public visits"
    );
  }
  
  /**
   * Find public visits by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of public visits
   */
  async findPublicVisitsByUserId(userId: string): Promise<RinkVisit[]> {
    return this.findVisitsByConstraints(
      [
        where("userId", "==", userId),
        where("isPublic", "==", true),
        orderBy("date", "desc")
      ],
      "Error finding public visits by user ID"
    );
  }
  
  /**
   * Save rink data to the global rinks collection
   * @param rinkId The rink ID
   * @param rinkData The rink data
   * @returns A promise that resolves when the rink data is saved
   */
  private async saveRinkData(rinkId: string, rinkData: Rink): Promise<void> {
    const rinkRef = doc(db, RINKS_COLLECTION, rinkId);
    const rinkDoc = await getDoc(rinkRef);
    
    const rinkDataToSave = {
      id: rinkId,
      name: rinkData.name,
      address: rinkData.address,
      position: rinkData.position,
      photo: rinkData.photo,
      rating: rinkData.rating,
      updatedAt: new Date().toISOString()
    };
    
    if (!rinkDoc.exists()) {
      // Save basic rink info to the global rinks collection
      await setDoc(rinkRef, {
        ...rinkDataToSave,
        createdAt: new Date().toISOString()
      });
      console.log("✅ Rink added to global collection:", rinkData.name);
    } else {
      // Update the rink info in case anything has changed
      await updateDoc(rinkRef, rinkDataToSave);
      console.log("✅ Rink updated in global collection:", rinkData.name);
    }
  }
  
  /**
   * Save a visit (create or update)
   * @param visit The visit to save
   * @returns A promise that resolves to the saved visit
   */
  async save(visit: RinkVisit): Promise<RinkVisit> {
    return this.executeQuery(
      async () => {
        // Save the rink data if provided
        if (visit.rinkData) {
          await this.saveRinkData(visit.rinkId, visit.rinkData);
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
      },
      "Error saving visit",
      visit
    );
  }
  
  /**
   * Save multiple visits in a batch operation
   * @param entities The visits to save
   * @returns A promise that resolves to the saved visits
   */
  async saveAll(entities: RinkVisit[]): Promise<RinkVisit[]> {
    if (!entities.length) return [];
    
    return this.executeQuery(
      async () => {
        const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
        const savedVisits: RinkVisit[] = [];
        
        // Process each visit
        for (const visit of entities) {
          // Save the rink data if provided
          if (visit.rinkData) {
            await this.saveRinkData(visit.rinkId, visit.rinkData);
          }
          
          const visitData = visit.toObject();
          
          if (visit.id) {
            // Update existing visit
            const visitRef = doc(db, RINK_VISITS_COLLECTION, visit.id);
            batch.update(visitRef, visitData);
          } else {
            // Create new visit
            const newRef = doc(collection(db, RINK_VISITS_COLLECTION));
            batch.set(newRef, visitData);
            visit.id = newRef.id;
          }
          
          savedVisits.push(visit);
        }
        
        // Commit the batch
        await batch.commit();
        console.log(`✅ Batch saved ${entities.length} visits`);
        
        return savedVisits;
      },
      "Error saving visits in batch",
      []
    );
  }
  
  /**
   * Delete a visit by its ID
   * @param id The visit ID
   * @returns A promise that resolves to true if the visit was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const visitRef = doc(db, RINK_VISITS_COLLECTION, id);
        await deleteDoc(visitRef);
        console.log(`Visit ${id} deleted successfully.`);
        return true;
      },
      "Error deleting visit",
      false
    );
  }
  
  /**
   * Delete multiple visits by their IDs
   * @param ids The visit IDs
   * @returns A promise that resolves to true if all visits were deleted, false otherwise
   */
  async deleteAll(ids: string[]): Promise<boolean> {
    if (!ids.length) return true;
    
    return this.executeQuery(
      async () => {
        const batch = await import("firebase/firestore").then(module => module.writeBatch(db));
        
        // Add delete operations to batch
        for (const id of ids) {
          const visitRef = doc(db, RINK_VISITS_COLLECTION, id);
          batch.delete(visitRef);
        }
        
        // Commit the batch
        await batch.commit();
        console.log(`✅ Batch deleted ${ids.length} visits`);
        
        return true;
      },
      "Error deleting visits in batch",
      false
    );
  }
  
  /**
   * Add a photo to a visit
   * @param visitId The visit ID
   * @param photoUrl The photo URL
   * @returns A promise that resolves to the updated visit
   */
  async addPhoto(visitId: string, photoUrl: string): Promise<RinkVisit> {
    return this.updateVisitAndSave(
      visitId,
      (visit) => visit.addPhoto(photoUrl),
      "Error adding photo to visit"
    );
  }
  
  /**
   * Remove a photo from a visit
   * @param visitId The visit ID
   * @param photoUrl The photo URL
   * @returns A promise that resolves to the updated visit
   */
  async removePhoto(visitId: string, photoUrl: string): Promise<RinkVisit> {
    return this.updateVisitAndSave(
      visitId,
      (visit) => visit.removePhoto(photoUrl),
      "Error removing photo from visit"
    );
  }
  
  /**
   * Update the rating for a visit
   * @param visitId The visit ID
   * @param rating The rating (1-5)
   * @returns A promise that resolves to the updated visit
   */
  async updateRating(visitId: string, rating: number): Promise<RinkVisit> {
    return this.updateVisitAndSave(
      visitId,
      (visit) => visit.updateRating(rating),
      "Error updating rating for visit"
    );
  }
  
  /**
   * Toggle the public status of a visit
   * @param visitId The visit ID
   * @returns A promise that resolves to the updated visit
   */
  async togglePublic(visitId: string): Promise<RinkVisit> {
    return this.updateVisitAndSave(
      visitId,
      (visit) => visit.togglePublic(),
      "Error toggling public status for visit"
    );
  }
}

// Create a singleton instance of the repository
export const rinkVisitRepository = new FirestoreRinkVisitRepository();
