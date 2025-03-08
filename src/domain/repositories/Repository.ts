/**
 * Pagination options for repository queries
 */
export interface PaginationOptions {
  /**
   * The page number (1-based)
   */
  page: number;
  
  /**
   * The number of items per page
   */
  pageSize: number;
}

/**
 * Pagination result
 * @template T The entity type
 */
export interface Page<T> {
  /**
   * The items in the current page
   */
  items: T[];
  
  /**
   * The total number of items across all pages
   */
  totalItems: number;
  
  /**
   * The current page number (1-based)
   */
  currentPage: number;
  
  /**
   * The number of items per page
   */
  pageSize: number;
  
  /**
   * The total number of pages
   */
  totalPages: number;
  
  /**
   * Whether there is a previous page
   */
  hasPrevious: boolean;
  
  /**
   * Whether there is a next page
   */
  hasNext: boolean;
}

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
   * Find multiple entities by their IDs
   * @param ids The entity IDs
   * @returns A promise that resolves to an array of entities
   */
  findByIds(ids: ID[]): Promise<T[]>;
  
  /**
   * Find all entities
   * @returns A promise that resolves to an array of entities
   */
  findAll(): Promise<T[]>;
  
  /**
   * Find all entities with pagination
   * @param options The pagination options
   * @returns A promise that resolves to a page of entities
   */
  findAllPaginated(options: PaginationOptions): Promise<Page<T>>;
  
  /**
   * Save an entity (create or update)
   * @param entity The entity to save
   * @returns A promise that resolves to the saved entity
   */
  save(entity: T): Promise<T>;
  
  /**
   * Save multiple entities in a batch operation
   * @param entities The entities to save
   * @returns A promise that resolves to the saved entities
   */
  saveAll(entities: T[]): Promise<T[]>;
  
  /**
   * Delete an entity by its ID
   * @param id The entity ID
   * @returns A promise that resolves to true if the entity was deleted, false otherwise
   */
  delete(id: ID): Promise<boolean>;
  
  /**
   * Delete multiple entities by their IDs
   * @param ids The entity IDs
   * @returns A promise that resolves to true if all entities were deleted, false otherwise
   */
  deleteAll(ids: ID[]): Promise<boolean>;
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
