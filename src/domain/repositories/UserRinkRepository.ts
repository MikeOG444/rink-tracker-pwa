import { UserRink } from '../models/UserRink';
import { Repository } from './Repository';
import { Rink } from '../../services/places';

/**
 * Repository interface for UserRink entities
 */
export interface UserRinkRepository extends Repository<UserRink, string> {
  /**
   * Find user rinks by user ID
   * @param userId The user ID
   * @returns A promise that resolves to an array of user rinks
   */
  findByUserId(userId: string): Promise<UserRink[]>;
  
  /**
   * Find a user rink by user ID and rink ID
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to the user rink or null if not found
   */
  findByUserIdAndRinkId(userId: string, rinkId: string): Promise<UserRink | null>;
  
  /**
   * Check if a user has visited a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to true if the user has visited the rink, false otherwise
   */
  hasUserVisitedRink(userId: string, rinkId: string): Promise<boolean>;
  
  /**
   * Get the visit count for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to the visit count
   */
  getVisitCount(userId: string, rinkId: string): Promise<number>;
  
  /**
   * Increment the visit count for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @param rink Optional rink data
   * @returns A promise that resolves to the updated user rink
   */
  incrementVisitCount(userId: string, rinkId: string, rink?: Rink): Promise<UserRink>;
  
  /**
   * Toggle the favorite status for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @returns A promise that resolves to the updated user rink
   */
  toggleFavorite(userId: string, rinkId: string): Promise<UserRink>;
  
  /**
   * Update the notes for a rink
   * @param userId The user ID
   * @param rinkId The rink ID
   * @param notes The notes
   * @returns A promise that resolves to the updated user rink
   */
  updateNotes(userId: string, rinkId: string, notes: string): Promise<UserRink>;
}
