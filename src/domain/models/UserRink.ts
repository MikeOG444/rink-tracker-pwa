import type { Rink } from '../../services/places';

/**
 * Interface representing the data structure of a UserRink
 */
export interface UserRinkData {
  id?: string;
  userId: string;
  rinkId: string;
  rinkData?: Rink;
  isFavorite: boolean;
  visitCount: number;
  lastVisitDate?: Date | string | null;
  hasVerifiedVisit?: boolean;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Class representing a user's relationship with a rink
 */
export class UserRink {
  id?: string;
  userId: string;
  rinkId: string;
  rinkData?: Rink;
  isFavorite: boolean;
  visitCount: number;
  lastVisitDate: Date | null;
  hasVerifiedVisit: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Create a new UserRink instance
   */
  constructor(data: UserRinkData) {
    this.id = data.id;
    this.userId = data.userId;
    this.rinkId = data.rinkId;
    this.rinkData = data.rinkData;
    this.isFavorite = data.isFavorite;
    this.visitCount = data.visitCount;
    this.lastVisitDate = data.lastVisitDate 
      ? (typeof data.lastVisitDate === 'string' ? new Date(data.lastVisitDate) : data.lastVisitDate)
      : null;
    this.hasVerifiedVisit = data.hasVerifiedVisit || false;
    this.notes = data.notes;
    this.createdAt = typeof data.createdAt === 'string' ? new Date(data.createdAt) : (data.createdAt || new Date());
    this.updatedAt = typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : (data.updatedAt || new Date());
    
    // Validate the user rink
    this.validate();
  }

  /**
   * Validate the user rink data
   * @throws Error if validation fails
   */
  validate(): void {
    if (!this.userId) {
      throw new Error('UserRink must have a user ID');
    }
    
    if (!this.rinkId) {
      throw new Error('UserRink must have a rink ID');
    }
    
    if (typeof this.isFavorite !== 'boolean') {
      throw new Error('UserRink isFavorite must be a boolean');
    }
    
    if (!Number.isInteger(this.visitCount) || this.visitCount < 0) {
      throw new Error('UserRink visitCount must be a non-negative integer');
    }
    
    if (this.lastVisitDate && isNaN(this.lastVisitDate.getTime())) {
      throw new Error('UserRink lastVisitDate must be a valid date');
    }
  }

  /**
   * Increment the visit count and update the last visit date
   */
  incrementVisitCount(visitDate: Date = new Date()): void {
    this.visitCount += 1;
    this.lastVisitDate = visitDate;
    this.updatedAt = new Date();
  }

  /**
   * Toggle the favorite status
   */
  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.updatedAt = new Date();
  }

  /**
   * Update the notes
   */
  updateNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Mark this rink as having a verified visit
   */
  markAsVerified(): void {
    this.hasVerifiedVisit = true;
    this.updatedAt = new Date();
  }

  /**
   * Convert the user rink to a plain object for storage
   */
  toObject(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      rinkId: this.rinkId,
      isFavorite: this.isFavorite,
      visitCount: this.visitCount,
      lastVisitDate: this.lastVisitDate ? this.lastVisitDate.toISOString() : null,
      hasVerifiedVisit: this.hasVerifiedVisit,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
    
    // Only include optional fields if they're defined
    if (this.notes !== undefined) data.notes = this.notes;
    
    // Only include id if it's defined
    if (this.id) {
      data.id = this.id;
    }
    
    return data;
  }

  /**
   * Create a UserRink from a Firestore document
   */
  static fromFirestore(id: string, data: any): UserRink {
    return new UserRink({
      id,
      userId: data.userId,
      rinkId: data.rinkId,
      isFavorite: data.isFavorite || false,
      visitCount: data.visitCount || 0,
      lastVisitDate: data.lastVisitDate?.toDate ? data.lastVisitDate.toDate() : data.lastVisitDate,
      hasVerifiedVisit: data.hasVerifiedVisit || false,
      notes: data.notes,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
    });
  }

  /**
   * Create a new UserRink with default values
   */
  static create(userId: string, rinkId: string, rinkData?: Rink): UserRink {
    const now = new Date();
    
    return new UserRink({
      userId,
      rinkId,
      rinkData,
      isFavorite: false,
      visitCount: 0,
      lastVisitDate: null,
      hasVerifiedVisit: false,
      createdAt: now,
      updatedAt: now
    });
  }
}
