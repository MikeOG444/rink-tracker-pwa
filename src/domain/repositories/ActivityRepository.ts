import { Activity } from '../models/Activity';
import { UserRepository } from './Repository';

/**
 * Repository interface for Activity entities
 */
export interface ActivityRepository extends UserRepository<Activity, string> {
  /**
   * Find activities by rink ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  findByRinkId(rinkId: string): Promise<Activity[]>;
  
  /**
   * Find activities by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to an array of activities
   */
  findByUserIdAndRinkId(userId: string, rinkId: string): Promise<Activity[]>;
  
  /**
   * Save an activity offline when the user is not connected to the internet
   * @param activity The activity to save offline
   * @returns A promise that resolves to true if the activity was saved offline, false otherwise
   */
  saveOffline(activity: Activity): Promise<boolean>;
  
  /**
   * Sync offline activities to the server when the user is back online
   * @returns A promise that resolves to true if the sync was successful, false otherwise
   */
  syncOfflineActivities(): Promise<boolean>;
}
