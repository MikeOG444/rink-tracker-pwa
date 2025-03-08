import { RinkVisit } from '../models/RinkVisit';
import { UserRepository } from './Repository';
import ActivityType from '../models/ActivityType';

/**
 * Repository interface for RinkVisit entities
 */
export interface RinkVisitRepository extends UserRepository<RinkVisit, string> {
  /**
   * Find visits by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of visits
   */
  findByRinkId(rinkId: string): Promise<RinkVisit[]>;
  
  /**
   * Find visits by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of visits
   */
  findByUserIdAndRinkId(userId: string, rinkId: string): Promise<RinkVisit[]>;
  
  /**
   * Find visits by activity type
   * @param activityType The activity type
   * @returns A promise that resolves to an array of visits
   */
  findByActivityType(activityType: ActivityType): Promise<RinkVisit[]>;
  
  /**
   * Find visits by user ID and activity type
   * @param userId The user ID
   * @param activityType The activity type
   * @returns A promise that resolves to an array of visits
   */
  findByUserIdAndActivityType(userId: string, activityType: ActivityType): Promise<RinkVisit[]>;
  
  /**
   * Find public visits
   * @returns A promise that resolves to an array of public visits
   */
  findPublicVisits(): Promise<RinkVisit[]>;
  
  /**
   * Find public visits by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of public visits
   */
  findPublicVisitsByUserId(userId: string): Promise<RinkVisit[]>;
  
  /**
   * Add a photo to a visit
   * @param visitId The visit ID
   * @param photoUrl The photo URL
   * @returns A promise that resolves to the updated visit
   */
  addPhoto(visitId: string, photoUrl: string): Promise<RinkVisit>;
  
  /**
   * Remove a photo from a visit
   * @param visitId The visit ID
   * @param photoUrl The photo URL
   * @returns A promise that resolves to the updated visit
   */
  removePhoto(visitId: string, photoUrl: string): Promise<RinkVisit>;
  
  /**
   * Update the rating for a visit
   * @param visitId The visit ID
   * @param rating The rating (1-5)
   * @returns A promise that resolves to the updated visit
   */
  updateRating(visitId: string, rating: number): Promise<RinkVisit>;
  
  /**
   * Toggle the public status of a visit
   * @param visitId The visit ID
   * @returns A promise that resolves to the updated visit
   */
  togglePublic(visitId: string): Promise<RinkVisit>;
}
