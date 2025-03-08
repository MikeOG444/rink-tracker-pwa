# Rink Tracker PWA - Repository Pattern Implementation

## Introduction

This document explains the repository pattern implementation in the Rink Tracker PWA. The repository pattern is a design pattern that abstracts the data access logic from the rest of the application, providing a clean separation between the domain model and data access layers.

## Repository Pattern Overview

### What is the Repository Pattern?

The repository pattern is a design pattern that:

1. **Abstracts Data Access**: Hides the details of how data is stored and retrieved
2. **Centralizes Data Logic**: Keeps all data access code in one place
3. **Simplifies Testing**: Makes it easier to mock data access for testing
4. **Improves Maintainability**: Makes it easier to change data sources without affecting business logic

### Benefits in Rink Tracker

For the Rink Tracker PWA, the repository pattern provides several key benefits:

1. **Offline Support**: Abstracts the complexity of offline-first data access
2. **Firebase Abstraction**: Hides the details of Firestore interactions
3. **Domain Focus**: Allows the domain model to focus on business logic
4. **Testing**: Simplifies testing of components that use repositories

## Repository Interfaces

### Base Repository Interface

The base `Repository` interface defines common operations for all repositories:

```typescript
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<boolean>;
  
  // Batch operations
  findByIds(ids: ID[]): Promise<T[]>;
  saveAll(entities: T[]): Promise<T[]>;
  deleteAll(ids: ID[]): Promise<boolean>;
  
  // Pagination
  findAllPaginated(options: PaginationOptions): Promise<Page<T>>;
}
```

### Domain-Specific Repository Interfaces

Each domain model has its own repository interface that extends the base interface:

```typescript
export interface ActivityRepository extends Repository<Activity, string> {
  findByUserId(userId: string): Promise<Activity[]>;
  findByRinkId(rinkId: string): Promise<Activity[]>;
  findByUserIdAndRinkId(userId: string, rinkId: string): Promise<Activity[]>;
  findByUserIdAndActivityType(userId: string, activityType: ActivityType): Promise<Activity[]>;
}

export interface UserRinkRepository extends Repository<UserRink, string> {
  findByUserId(userId: string): Promise<UserRink[]>;
  findByRinkId(rinkId: string): Promise<UserRink[]>;
  findByUserIdAndRinkId(userId: string, rinkId: string): Promise<UserRink | null>;
}

export interface RinkVisitRepository extends Repository<RinkVisit, string> {
  findByUserId(userId: string): Promise<RinkVisit[]>;
  findByRinkId(rinkId: string): Promise<RinkVisit[]>;
  findByUserIdAndRinkId(userId: string, rinkId: string): Promise<RinkVisit[]>;
  findLatestByUserIdAndRinkId(userId: string, rinkId: string): Promise<RinkVisit | null>;
}
```

## Repository Implementations

### Firestore Repositories

Each repository interface has a Firestore implementation:

```typescript
export class FirestoreActivityRepository implements ActivityRepository {
  private readonly collection = 'activities';
  private readonly db: firebase.firestore.Firestore;
  private readonly cache: Map<string, CacheEntry<Activity>> = new Map();
  
  constructor(db: firebase.firestore.Firestore) {
    this.db = db;
  }
  
  async findById(id: string): Promise<Activity | null> {
    // Check cache first
    const cachedActivity = this.getCachedActivity(id);
    if (cachedActivity) {
      return cachedActivity;
    }
    
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const activity = Activity.fromFirestore(doc.id, doc.data() as FirestoreActivityData);
      
      // Cache the result
      this.cacheActivity(activity);
      
      return activity;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find activity with ID: ${id}`,
        ErrorSeverity.ERROR,
        ErrorCategory.DATABASE,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  // Other methods...
}
```

### Key Features of Repository Implementations

1. **Caching**: Repositories implement caching to improve performance
2. **Error Handling**: Consistent error handling with custom error classes
3. **Batch Operations**: Efficient batch operations for better performance
4. **Pagination**: Support for paginated queries
5. **Offline Support**: Integration with IndexedDB for offline support

## Domain Models and Repositories

### Domain Model Structure

Domain models are designed to work seamlessly with repositories:

```typescript
export class Activity {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly rinkId: string,
    public readonly rinkName: string,
    public readonly activityType: ActivityType,
    public readonly date: Date,
    public readonly notes: string,
    public readonly verified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  // Factory methods
  static create(data: ActivityCreateData): Activity {
    // Validation logic
    if (!data.userId) {
      throw new ValidationError('User ID is required');
    }
    
    if (!data.rinkId) {
      throw new ValidationError('Rink ID is required');
    }
    
    // Create new activity
    return new Activity(
      undefined, // New activities don't have an ID yet
      data.userId,
      data.rinkId,
      data.rinkName,
      data.activityType,
      data.date || new Date(),
      data.notes || '',
      data.verified || false,
      new Date(),
      new Date()
    );
  }
  
  // Firestore conversion methods
  static fromFirestore(id: string, data: FirestoreActivityData): Activity {
    return new Activity(
      id,
      data.userId,
      data.rinkId,
      data.rinkName,
      data.activityType,
      data.date.toDate(),
      data.notes || '',
      data.verified || false,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    );
  }
  
  toFirestore(): FirestoreActivityData {
    return {
      userId: this.userId,
      rinkId: this.rinkId,
      rinkName: this.rinkName,
      activityType: this.activityType,
      date: firebase.firestore.Timestamp.fromDate(this.date),
      notes: this.notes,
      verified: this.verified,
      createdAt: firebase.firestore.Timestamp.fromDate(this.createdAt),
      updatedAt: firebase.firestore.Timestamp.fromDate(this.updatedAt)
    };
  }
  
  // Business logic methods
  isVerified(): boolean {
    return this.verified;
  }
  
  withNotes(notes: string): Activity {
    return new Activity(
      this.id,
      this.userId,
      this.rinkId,
      this.rinkName,
      this.activityType,
      this.date,
      notes,
      this.verified,
      this.createdAt,
      new Date() // Update the updatedAt timestamp
    );
  }
  
  // Other methods...
}
```

### Repository Usage in Components

Repositories are used in components through custom hooks:

```typescript
export function useActivities(userId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const activityRepository = useMemo(() => {
    return new FirestoreActivityRepository(firebase.firestore());
  }, []);
  
  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        const userActivities = await activityRepository.findByUserId(userId);
        setActivities(userActivities);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load activities'));
      } finally {
        setLoading(false);
      }
    }
    
    loadActivities();
  }, [userId, activityRepository]);
  
  const saveActivity = useCallback(async (activity: Activity) => {
    try {
      const savedActivity = await activityRepository.save(activity);
      setActivities(prevActivities => {
        // Replace if exists, otherwise add
        const exists = prevActivities.some(a => a.id === savedActivity.id);
        if (exists) {
          return prevActivities.map(a => a.id === savedActivity.id ? savedActivity : a);
        } else {
          return [...prevActivities, savedActivity];
        }
      });
      return savedActivity;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save activity');
    }
  }, [activityRepository]);
  
  // Other operations...
  
  return {
    activities,
    loading,
    error,
    saveActivity,
    // Other operations...
  };
}
```

## Offline Support

### IndexedDB Integration

The repository pattern integrates with IndexedDB for offline support:

```typescript
export class FirestoreActivityRepository implements ActivityRepository {
  // Other methods...
  
  async save(activity: Activity): Promise<Activity> {
    try {
      // Check if online
      if (navigator.onLine) {
        // Save to Firestore
        const docRef = activity.id
          ? this.db.collection(this.collection).doc(activity.id)
          : this.db.collection(this.collection).doc();
        
        const id = docRef.id;
        const activityWithId = activity.id ? activity : new Activity(
          id,
          activity.userId,
          activity.rinkId,
          activity.rinkName,
          activity.activityType,
          activity.date,
          activity.notes,
          activity.verified,
          activity.createdAt,
          activity.updatedAt
        );
        
        await docRef.set(activityWithId.toFirestore());
        
        // Cache the result
        this.cacheActivity(activityWithId);
        
        return activityWithId;
      } else {
        // Save to IndexedDB for offline support
        const id = activity.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const activityWithId = activity.id ? activity : new Activity(
          id,
          activity.userId,
          activity.rinkId,
          activity.rinkName,
          activity.activityType,
          activity.date,
          activity.notes,
          activity.verified,
          activity.createdAt,
          activity.updatedAt
        );
        
        await saveOfflineActivity(activityWithId);
        
        // Cache the result
        this.cacheActivity(activityWithId);
        
        return activityWithId;
      }
    } catch (error) {
      throw new DatabaseError(
        `Failed to save activity`,
        ErrorSeverity.ERROR,
        ErrorCategory.DATABASE,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  // Sync offline activities
  async syncOfflineActivities(): Promise<Activity[]> {
    try {
      const offlineActivities = await getOfflineActivities();
      
      if (offlineActivities.length === 0) {
        return [];
      }
      
      const batch = this.db.batch();
      const syncedActivities: Activity[] = [];
      
      for (const activity of offlineActivities) {
        // Skip activities that already have a non-temporary ID and exist in Firestore
        if (activity.id && !activity.id.startsWith('temp_')) {
          const exists = await this.findById(activity.id);
          if (exists) {
            syncedActivities.push(exists);
            continue;
          }
        }
        
        // Create a new document reference
        const docRef = this.db.collection(this.collection).doc();
        
        // Create a new activity with the generated ID
        const syncedActivity = new Activity(
          docRef.id,
          activity.userId,
          activity.rinkId,
          activity.rinkName,
          activity.activityType,
          activity.date,
          activity.notes,
          activity.verified,
          activity.createdAt,
          activity.updatedAt
        );
        
        // Add to batch
        batch.set(docRef, syncedActivity.toFirestore());
        
        // Add to result
        syncedActivities.push(syncedActivity);
      }
      
      // Commit the batch
      await batch.commit();
      
      // Clear offline activities
      await clearOfflineActivities();
      
      // Cache the results
      for (const activity of syncedActivities) {
        this.cacheActivity(activity);
      }
      
      return syncedActivities;
    } catch (error) {
      throw new DatabaseError(
        `Failed to sync offline activities`,
        ErrorSeverity.ERROR,
        ErrorCategory.DATABASE,
        error instanceof Error ? error : undefined
      );
    }
  }
}
```

### Offline Detection and Sync

The application detects when it comes back online and syncs data:

```typescript
export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const activityRepository = useMemo(() => {
    return new FirestoreActivityRepository(firebase.firestore());
  }, []);
  
  const syncOfflineData = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      // Sync activities
      await activityRepository.syncOfflineActivities();
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sync offline data'));
    } finally {
      setIsSyncing(false);
    }
  }, [activityRepository]);
  
  // Set up online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online. Starting sync...');
      syncOfflineData();
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    
    // Check if we need to sync on mount
    if (navigator.onLine) {
      const lastSync = localStorage.getItem('lastSyncTime');
      const lastSyncDate = lastSync ? new Date(lastSync) : null;
      const now = new Date();
      
      // If last sync was more than 1 hour ago or never, sync now
      if (!lastSyncDate || (now.getTime() - lastSyncDate.getTime() > 60 * 60 * 1000)) {
        syncOfflineData();
      }
    }
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineData]);
  
  return {
    isSyncing,
    lastSyncTime,
    error,
    syncOfflineData
  };
}
```

## Caching Strategy

### Cache Implementation

Repositories implement caching to improve performance:

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class FirestoreActivityRepository implements ActivityRepository {
  private readonly cache: Map<string, CacheEntry<Activity>> = new Map();
  private readonly cacheByUserId: Map<string, CacheEntry<Activity[]>> = new Map();
  private readonly cacheByRinkId: Map<string, CacheEntry<Activity[]>> = new Map();
  private readonly cacheByUserIdAndRinkId: Map<string, CacheEntry<Activity[]>> = new Map();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  // Cache methods
  private getCachedActivity(id: string): Activity | null {
    const entry = this.cache.get(id);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache entry is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(id);
      return null;
    }
    
    return entry.data;
  }
  
  private cacheActivity(activity: Activity): void {
    if (!activity.id) {
      return;
    }
    
    this.cache.set(activity.id, {
      data: activity,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheTTL
    });
    
    // Invalidate related caches
    this.cacheByUserId.delete(activity.userId);
    this.cacheByRinkId.delete(activity.rinkId);
    this.cacheByUserIdAndRinkId.delete(`${activity.userId}_${activity.rinkId}`);
  }
  
  // Other cache methods...
}
```

### Cache Invalidation

Caches are invalidated when data changes:

```typescript
export class FirestoreActivityRepository implements ActivityRepository {
  // Other methods...
  
  async delete(id: string): Promise<boolean> {
    try {
      // Get the activity first to invalidate caches
      const activity = await this.findById(id);
      
      if (!activity) {
        return false;
      }
      
      // Delete from Firestore
      await this.db.collection(this.collection).doc(id).delete();
      
      // Invalidate caches
      this.cache.delete(id);
      this.cacheByUserId.delete(activity.userId);
      this.cacheByRinkId.delete(activity.rinkId);
      this.cacheByUserIdAndRinkId.delete(`${activity.userId}_${activity.rinkId}`);
      
      return true;
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete activity with ID: ${id}`,
        ErrorSeverity.ERROR,
        ErrorCategory.DATABASE,
        error instanceof Error ? error : undefined
      );
    }
  }
}
```

## Testing Repositories

### Repository Testing Strategy

Repositories are tested using Vitest and mock Firestore:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirestoreActivityRepository } from '../../../domain/repositories/FirestoreActivityRepository';
import { Activity } from '../../../domain/models/Activity';
import { ActivityType } from '../../../domain/models/ActivityType';

describe('FirestoreActivityRepository', () => {
  let repository: FirestoreActivityRepository;
  let mockFirestore: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockSet: any;
  
  beforeEach(() => {
    // Set up mocks
    mockGet = vi.fn();
    mockSet = vi.fn();
    mockDoc = vi.fn().mockReturnValue({
      get: mockGet,
      set: mockSet
    });
    mockCollection = vi.fn().mockReturnValue({
      doc: mockDoc
    });
    mockFirestore = {
      collection: mockCollection
    };
    
    // Create repository with mock Firestore
    repository = new FirestoreActivityRepository(mockFirestore as any);
  });
  
  describe('findById', () => {
    it('should return null if document does not exist', async () => {
      // Arrange
      mockGet.mockResolvedValue({
        exists: false
      });
      
      // Act
      const result = await repository.findById('non-existent-id');
      
      // Assert
      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith('activities');
      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
      expect(mockGet).toHaveBeenCalled();
    });
    
    it('should return Activity if document exists', async () => {
      // Arrange
      const now = new Date();
      const firestoreData = {
        userId: 'user-1',
        rinkId: 'rink-1',
        rinkName: 'Test Rink',
        activityType: ActivityType.GAME,
        date: { toDate: () => now },
        notes: 'Test notes',
        verified: true,
        createdAt: { toDate: () => now },
        updatedAt: { toDate: () => now }
      };
      
      mockGet.mockResolvedValue({
        exists: true,
        id: 'activity-1',
        data: () => firestoreData
      });
      
      // Act
      const result = await repository.findById('activity-1');
      
      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe('activity-1');
      expect(result?.userId).toBe('user-1');
      expect(result?.rinkId).toBe('rink-1');
      expect(result?.activityType).toBe(ActivityType.GAME);
    });
  });
  
  // Other tests...
});
```

## Best Practices for Using Repositories

### 1. Use Repository Interfaces

Always depend on repository interfaces, not implementations:

```typescript
// Good
function useActivities(activityRepository: ActivityRepository) {
  // ...
}

// Bad
function useActivities(activityRepository: FirestoreActivityRepository) {
  // ...
}
```

### 2. Create Repositories with Factory Functions

Use factory functions to create repositories:

```typescript
export function createActivityRepository(): ActivityRepository {
  return new FirestoreActivityRepository(firebase.firestore());
}
```

### 3. Handle Repository Errors

Handle repository errors appropriately:

```typescript
try {
  const activities = await activityRepository.findByUserId(userId);
  setActivities(activities);
} catch (error) {
  if (error instanceof DatabaseError) {
    // Handle database errors
    showNotification("Failed to load activities. Please try again later.");
  } else {
    // Handle other errors
    ErrorHandler.getInstance().handleError(error, "ActivityList");
  }
}
```

### 4. Use Batch Operations for Better Performance

Use batch operations when working with multiple entities:

```typescript
// Good
const savedActivities = await activityRepository.saveAll(activities);

// Bad
const savedActivities = await Promise.all(
  activities.map(activity => activityRepository.save(activity))
);
```

### 5. Use Pagination for Large Datasets

Use pagination when working with large datasets:

```typescript
const page = await activityRepository.findAllPaginated({
  page: 1,
  size: 20,
  sort: {
    field: 'date',
    direction: 'desc'
  }
});

console.log(`Showing ${page.content.length} of ${page.totalElements} activities`);
```

## Conclusion

The repository pattern implementation in Rink Tracker PWA provides a solid foundation for data access. By abstracting the details of how data is stored and retrieved, it allows the rest of the application to focus on business logic and user experience.

New engineers should focus on understanding the repository interfaces and how they are used in the application. This understanding will provide a solid foundation for contributing to the project.

For more details on specific repository implementations, refer to the relevant source files and the architecture documentation.
