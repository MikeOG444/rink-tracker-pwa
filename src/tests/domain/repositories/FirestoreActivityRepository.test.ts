import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { FirestoreActivityRepository } from '../../../domain/repositories/FirestoreActivityRepository';
import { PaginationOptions } from '../../../domain/repositories/Repository';

// Mock the Activity model
vi.mock('../../../domain/models/Activity', () => {
  return {
    Activity: {
      fromFirestore: vi.fn((docId, data) => ({
        id: docId,
        userId: data.userId,
        rinkId: data.rinkId,
        activityType: data.activityType,
        date: data.date,
        duration: data.duration,
        notes: data.notes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }))
    }
  };
});

// Mock the firebase module
vi.mock('firebase/firestore');
vi.mock('../../../services/indexedDB');

// Mock the db object
vi.mock('../../../firebase', () => ({
  db: {}
}));

describe('FirestoreActivityRepository', () => {
  let repository: FirestoreActivityRepository;
  
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new FirestoreActivityRepository();
  });
  
  describe('findAllPaginated', () => {
    it('should return paginated activities', async () => {
      // Arrange
      const mockActivities = [
        {
          id: '1',
          userId: 'user1',
          rinkId: 'rink1',
          activityType: 'hockey_game',
          date: new Date().toISOString(),
          duration: 60,
          notes: 'Test activity 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'user1',
          rinkId: 'rink2',
          activityType: 'figure_skating_practice',
          date: new Date().toISOString(),
          duration: 45,
          notes: 'Test activity 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Mock the Firestore query and snapshot
      const mockSnapshot = {
        docs: mockActivities.map(activity => ({
          id: activity.id,
          data: () => activity,
          exists: () => true
        })),
        size: mockActivities.length
      };
      
      // Mock the Firestore functions
      (collection as any).mockReturnValue('activities-collection');
      (orderBy as any).mockReturnValue('order-by-date');
      (limit as any).mockReturnValue('limit-10');
      (query as any).mockReturnValue('activities-query');
      (getDocs as any).mockResolvedValue(mockSnapshot);
      
      const paginationOptions: PaginationOptions = {
        page: 1,
        pageSize: 10
      };
      
      // Act
      const result = await repository.findAllPaginated(paginationOptions);
      
      // Assert
      expect(collection).toHaveBeenCalledWith({}, 'activities');
      expect(query).toHaveBeenCalledWith('activities-collection', expect.anything(), expect.anything());
      expect(orderBy).toHaveBeenCalledWith('date', 'desc');
      expect(limit).toHaveBeenCalledWith(10);
      expect(getDocs).toHaveBeenCalledWith('activities-query');
      
      expect(result.items.length).toBe(2);
      expect(result.totalItems).toBe(2);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.hasPrevious).toBe(false);
      expect(result.hasNext).toBe(false);
      
      // Verify the returned activities
      expect(result.items[0].id).toBe('1');
      expect((result.items[0] as any).activityType).toBe('hockey_game');
      expect(result.items[1].id).toBe('2');
      expect((result.items[1] as any).activityType).toBe('figure_skating_practice');
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      (collection as any).mockReturnValue('activities-collection');
      (query as any).mockReturnValue('activities-query');
      (getDocs as any).mockRejectedValue(new Error('Firestore error'));
      
      const paginationOptions: PaginationOptions = {
        page: 1,
        pageSize: 10
      };
      
      // Act
      const result = await repository.findAllPaginated(paginationOptions);
      
      // Assert
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(0);
      expect(result.hasPrevious).toBe(false);
      expect(result.hasNext).toBe(false);
    });
    
    it('should calculate pagination metadata correctly', async () => {
      // Arrange
      const mockActivities = Array(25).fill(null).map((_, index) => ({
        id: `${index + 1}`,
        userId: 'user1',
        rinkId: `rink${index + 1}`,
        activityType: 'hockey_game',
        date: new Date().toISOString(),
        duration: 60,
        notes: `Test activity ${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Mock the Firestore query and snapshot for count
      const mockCountSnapshot = {
        size: 25
      };
      
      // Mock the Firestore query and snapshot for page
      const mockPageSnapshot = {
        docs: mockActivities.slice(0, 10).map(activity => ({
          id: activity.id,
          data: () => activity,
          exists: () => true
        })),
        size: 10
      };
      
      // Mock the Firestore functions
      (collection as any).mockReturnValue('activities-collection');
      (orderBy as any).mockReturnValue('order-by-date');
      (limit as any).mockReturnValue('limit-10');
      (query as any).mockReturnValueOnce('count-query').mockReturnValueOnce('page-query');
      (getDocs as any).mockResolvedValueOnce(mockCountSnapshot).mockResolvedValueOnce(mockPageSnapshot);
      
      const paginationOptions: PaginationOptions = {
        page: 1,
        pageSize: 10
      };
      
      // Act
      const result = await repository.findAllPaginated(paginationOptions);
      
      // Assert
      expect(result.items.length).toBe(10);
      expect(result.totalItems).toBe(25);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.hasPrevious).toBe(false);
      expect(result.hasNext).toBe(true);
      
      // Test with page 2
      (collection as any).mockReturnValue('activities-collection');
      (orderBy as any).mockReturnValue('order-by-date');
      (limit as any).mockReturnValue('limit-10');
      (query as any).mockReturnValueOnce('count-query').mockReturnValueOnce('page-query');
      (getDocs as any).mockResolvedValueOnce(mockCountSnapshot).mockResolvedValueOnce({
        docs: mockActivities.slice(10, 20).map(activity => ({
          id: activity.id,
          data: () => activity,
          exists: () => true
        })),
        size: 10
      });
      
      const page2Options: PaginationOptions = {
        page: 2,
        pageSize: 10
      };
      
      const page2Result = await repository.findAllPaginated(page2Options);
      
      expect(page2Result.currentPage).toBe(2);
      expect(page2Result.hasPrevious).toBe(true);
      expect(page2Result.hasNext).toBe(true);
    });
  });
});
