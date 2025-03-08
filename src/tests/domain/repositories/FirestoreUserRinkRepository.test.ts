import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { FirestoreUserRinkRepository } from '../../../domain/repositories/FirestoreUserRinkRepository';

// Import UserRink interface for type checking
import { UserRink } from '../../../domain/models/UserRink';

// Mock the UserRink model
vi.mock('../../../domain/models/UserRink', () => {
  return {
    UserRink: {
      fromFirestore: vi.fn((docId, data) => ({
        id: docId,
        userId: data.userId,
        rinkId: data.rinkId,
        isFavorite: data.isFavorite,
        lastVisitDate: data.lastVisitDate || data.lastVisited,
        visitCount: data.visitCount,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        validate: vi.fn(),
        incrementVisitCount: vi.fn(),
        toggleFavorite: vi.fn(),
        toObject: vi.fn(() => ({
          userId: data.userId,
          rinkId: data.rinkId,
          isFavorite: data.isFavorite,
          lastVisitDate: data.lastVisitDate || data.lastVisited,
          visitCount: data.visitCount,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }))
      }))
    }
  };
});

// Mock the firebase module
vi.mock('firebase/firestore');

// Mock the db object
vi.mock('../../../firebase', () => ({
  db: {}
}));

describe('FirestoreUserRinkRepository', () => {
  let repository: FirestoreUserRinkRepository;
  
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new FirestoreUserRinkRepository();
  });
  
  describe('findByUserIdAndRinkId', () => {
    it('should return a user rink when it exists', async () => {
      // Arrange
      const userId = 'user1';
      const rinkId = 'rink1';
      const mockUserRink = {
        id: `${userId}_${rinkId}`,
        userId,
        rinkId,
        isFavorite: true,
        lastVisited: new Date().toISOString(),
        visitCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (getDoc as any).mockResolvedValue({
        id: mockUserRink.id,
        data: () => mockUserRink,
        exists: () => true
      });
      
      // Act
      const result = await repository.findByUserIdAndRinkId(userId, rinkId);
      
      // Assert
      expect(doc).toHaveBeenCalledWith({}, 'user_rinks', `${userId}_${rinkId}`);
      expect(getDoc).toHaveBeenCalledWith('user-rink-doc');
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockUserRink.id);
      expect((result as any).isFavorite).toBe(true);
      expect((result as any).visitCount).toBe(5);
    });
    
    it('should return null when user rink does not exist', async () => {
      // Arrange
      const userId = 'user1';
      const rinkId = 'rink1';
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (getDoc as any).mockResolvedValue({
        exists: () => false
      });
      
      // Act
      const result = await repository.findByUserIdAndRinkId(userId, rinkId);
      
      // Assert
      expect(doc).toHaveBeenCalledWith({}, 'user_rinks', `${userId}_${rinkId}`);
      expect(getDoc).toHaveBeenCalledWith('user-rink-doc');
      expect(result).toBeNull();
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      const userId = 'user1';
      const rinkId = 'rink1';
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (getDoc as any).mockRejectedValue(new Error('Firestore error'));
      
      // Act
      const result = await repository.findByUserIdAndRinkId(userId, rinkId);
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('findByUserId', () => {
    it('should return user rinks for a user', async () => {
      // Arrange
      const userId = 'user1';
      const mockUserRinks = [
        {
          id: `${userId}_rink1`,
          userId,
          rinkId: 'rink1',
          isFavorite: true,
          lastVisited: new Date().toISOString(),
          visitCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `${userId}_rink2`,
          userId,
          rinkId: 'rink2',
          isFavorite: false,
          lastVisited: new Date().toISOString(),
          visitCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Mock the Firestore query and snapshot
      const mockSnapshot = {
        docs: mockUserRinks.map(userRink => ({
          id: userRink.id,
          data: () => userRink,
          exists: () => true
        })),
        size: mockUserRinks.length
      };
      
      // Mock the Firestore functions
      (collection as any).mockReturnValue('userRinks-collection');
      (where as any).mockReturnValue('where-userId');
      (query as any).mockReturnValue('userRinks-query');
      (getDocs as any).mockResolvedValue(mockSnapshot);
      
      // Act
      const result = await repository.findByUserId(userId);
      
      // Assert
      expect(collection).toHaveBeenCalledWith({}, 'user_rinks');
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(query).toHaveBeenCalledWith('userRinks-collection', 'where-userId');
      expect(getDocs).toHaveBeenCalledWith('userRinks-query');
      
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(mockUserRinks[0].id);
      expect((result[0] as any).isFavorite).toBe(true);
      expect(result[1].id).toBe(mockUserRinks[1].id);
      expect((result[1] as any).isFavorite).toBe(false);
    });
    
    it('should return an empty array when no user rinks exist', async () => {
      // Arrange
      const userId = 'user1';
      
      // Mock the Firestore query and snapshot
      const mockSnapshot = {
        docs: [],
        size: 0
      };
      
      // Mock the Firestore functions
      (collection as any).mockReturnValue('userRinks-collection');
      (where as any).mockReturnValue('where-userId');
      (query as any).mockReturnValue('userRinks-query');
      (getDocs as any).mockResolvedValue(mockSnapshot);
      
      // Act
      const result = await repository.findByUserId(userId);
      
      // Assert
      expect(collection).toHaveBeenCalledWith({}, 'user_rinks');
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(query).toHaveBeenCalledWith('userRinks-collection', 'where-userId');
      expect(getDocs).toHaveBeenCalledWith('userRinks-query');
      
      expect(result).toEqual([]);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      const userId = 'user1';
      
      // Mock the Firestore functions
      (collection as any).mockReturnValue('userRinks-collection');
      (where as any).mockReturnValue('where-userId');
      (query as any).mockReturnValue('userRinks-query');
      (getDocs as any).mockRejectedValue(new Error('Firestore error'));
      
      // Act
      const result = await repository.findByUserId(userId);
      
      // Assert
      expect(result).toEqual([]);
    });
  });
  
  describe('save', () => {
    it('should save a user rink', async () => {
      // Arrange
      const mockUserRink = {
        id: 'user1_rink1',
        userId: 'user1',
        rinkId: 'rink1',
        isFavorite: true,
        lastVisitDate: new Date().toISOString(),
        visitCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validate: vi.fn(),
        incrementVisitCount: vi.fn(),
        toggleFavorite: vi.fn(),
        toObject: vi.fn(() => ({
          userId: 'user1',
          rinkId: 'rink1',
          isFavorite: true,
          lastVisitDate: expect.any(String),
          visitCount: 5,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }))
      } as unknown as UserRink;
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (setDoc as any).mockResolvedValue(undefined);
      
      // Act
      const result = await repository.save(mockUserRink);
      
      // Assert
      expect(doc).toHaveBeenCalledWith({}, 'user_rinks', mockUserRink.id);
      expect(setDoc).toHaveBeenCalledWith('user-rink-doc', expect.anything());
      expect(result).toBe(mockUserRink);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      const mockUserRink = {
        id: 'user1_rink1',
        userId: 'user1',
        rinkId: 'rink1',
        isFavorite: true,
        lastVisitDate: new Date().toISOString(),
        visitCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validate: vi.fn(),
        incrementVisitCount: vi.fn(),
        toggleFavorite: vi.fn(),
        toObject: vi.fn(() => ({
          userId: 'user1',
          rinkId: 'rink1',
          isFavorite: true,
          lastVisitDate: expect.any(String),
          visitCount: 5,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }))
      } as unknown as UserRink;
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (setDoc as any).mockRejectedValue(new Error('Firestore error'));
      
      // Act & Assert
      await expect(repository.save(mockUserRink)).rejects.toThrow();
    });
  });
  
  describe('delete', () => {
    it('should delete a user rink', async () => {
      // Arrange
      const mockUserRink = {
        id: 'user1_rink1',
        userId: 'user1',
        rinkId: 'rink1',
        isFavorite: true,
        lastVisitDate: new Date().toISOString(),
        visitCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validate: vi.fn(),
        incrementVisitCount: vi.fn(),
        toggleFavorite: vi.fn(),
        toObject: vi.fn()
      } as unknown as UserRink;
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (deleteDoc as any).mockResolvedValue(undefined);
      
      // Act
      await repository.delete(mockUserRink.id || '');
      
      // Assert
      expect(doc).toHaveBeenCalledWith({}, 'user_rinks', mockUserRink.id);
      expect(deleteDoc).toHaveBeenCalledWith('user-rink-doc');
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      const userRinkId = 'user1_rink1';
      
      // Mock the Firestore functions
      (doc as any).mockReturnValue('user-rink-doc');
      (deleteDoc as any).mockRejectedValue(new Error('Firestore error'));
      
      // Act & Assert
      await expect(repository.delete(userRinkId)).rejects.toThrow();
    });
  });
});
