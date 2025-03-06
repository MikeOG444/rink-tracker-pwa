/**
 * Generic repository interface for CRUD operations
 * @template T The entity type
 * @template ID The ID type
 */
export interface Repository<T, ID> {
  /**
   * Find an entity by its ID
   * @param id The entity ID
   * @returns A promise that resolves to the entity or null if not found
   */
  findById(id: ID): Promise<T | null>;
  
  /**
   * Find all entities
   * @returns A promise that resolves to an array of entities
   */
  findAll(): Promise<T[]>;
  
  /**
   * Save an entity (create or update)
   * @param entity The entity to save
   * @returns A promise that resolves to the saved entity
   */
  save(entity: T): Promise<T>;
  
  /**
   * Delete an entity by its ID
   * @param id The entity ID
   * @returns A promise that resolves to true if the entity was deleted, false otherwise
   */
  delete(id: ID): Promise<boolean>;
}

/**
 * Repository interface for entities that belong to a user
 * @template T The entity type
 * @template ID The ID type
 */
export interface UserRepository<T, ID> extends Repository<T, ID> {
  /**
   * Find all entities for a specific user
   * @param userId The user ID
   * @returns A promise that resolves to an array of entities
   */
  findByUserId(userId: string): Promise<T[]>;
}
