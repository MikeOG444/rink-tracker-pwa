import type { Rink } from '../../services/places';
import ActivityType from './ActivityType';

/**
 * Interface representing the data structure of a RinkVisit
 */
export interface RinkVisitData {
  id?: string;
  userId: string;
  rinkId: string;
  rinkData?: Rink;
  date: Date | string;
  activityType: ActivityType;
  duration?: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 stars
  photos?: string[]; // URLs to photos
  isPublic: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Class representing a visit to a rink
 */
export class RinkVisit {
  id?: string;
  userId: string;
  rinkId: string;
  rinkData?: Rink;
  date: Date;
  activityType: ActivityType;
  duration: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 stars
  photos: string[]; // URLs to photos
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Create a new RinkVisit instance
   */
  constructor(data: RinkVisitData) {
    this.id = data.id;
    this.userId = data.userId;
    this.rinkId = data.rinkId;
    this.rinkData = data.rinkData;
    this.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    this.activityType = data.activityType;
    this.duration = data.duration || 60; // Default to 1 hour
    this.notes = data.notes;
    this.rating = data.rating;
    this.photos = data.photos || [];
    this.isPublic = data.isPublic;
    this.createdAt = typeof data.createdAt === 'string' ? new Date(data.createdAt) : (data.createdAt || new Date());
    this.updatedAt = typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : (data.updatedAt || new Date());
    
    // Validate the rink visit
    this.validate();
  }

  /**
   * Validate the rink visit data
   * @throws Error if validation fails
   */
  validate(): void {
    if (!this.userId) {
      throw new Error('RinkVisit must have a user ID');
    }
    
    if (!this.rinkId) {
      throw new Error('RinkVisit must have a rink ID');
    }
    
    if (isNaN(this.date.getTime())) {
      throw new Error('RinkVisit must have a valid date');
    }
    
    if (!Object.values(ActivityType).includes(this.activityType)) {
      throw new Error(`Invalid activity type: ${this.activityType}`);
    }
    
    if (!Number.isInteger(this.duration) || this.duration <= 0) {
      throw new Error('RinkVisit duration must be a positive integer');
    }
    
    if (this.rating !== undefined && (this.rating < 1 || this.rating > 5 || !Number.isInteger(this.rating))) {
      throw new Error('RinkVisit rating must be an integer between 1 and 5');
    }
    
    if (typeof this.isPublic !== 'boolean') {
      throw new Error('RinkVisit isPublic must be a boolean');
    }
  }

  /**
   * Format the duration as a human-readable string
   */
  formatDuration(): string {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  }

  /**
   * Add a photo to the visit
   */
  addPhoto(photoUrl: string): void {
    this.photos.push(photoUrl);
    this.updatedAt = new Date();
  }

  /**
   * Remove a photo from the visit
   */
  removePhoto(photoUrl: string): void {
    this.photos = this.photos.filter(url => url !== photoUrl);
    this.updatedAt = new Date();
  }

  /**
   * Update the rating
   */
  updateRating(rating: number): void {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
    
    this.rating = rating;
    this.updatedAt = new Date();
  }

  /**
   * Toggle the public status
   */
  togglePublic(): void {
    this.isPublic = !this.isPublic;
    this.updatedAt = new Date();
  }

  /**
   * Convert the rink visit to a plain object for storage
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      rinkId: this.rinkId,
      date: this.date.toISOString(),
      activityType: this.activityType,
      duration: this.duration,
      notes: this.notes,
      rating: this.rating,
      photos: this.photos,
      isPublic: this.isPublic,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Create a RinkVisit from a Firestore document
   */
  static fromFirestore(id: string, data: any): RinkVisit {
    return new RinkVisit({
      id,
      userId: data.userId,
      rinkId: data.rinkId,
      date: data.date.toDate ? data.date.toDate() : new Date(data.date),
      activityType: data.activityType,
      duration: data.duration || 60,
      notes: data.notes,
      rating: data.rating,
      photos: data.photos || [],
      isPublic: data.isPublic || false,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
    });
  }

  /**
   * Create a new RinkVisit with default values
   */
  static create(
    userId: string, 
    rinkId: string, 
    activityType: ActivityType = ActivityType.RECREATIONAL_SKATING,
    rinkData?: Rink
  ): RinkVisit {
    const now = new Date();
    
    return new RinkVisit({
      userId,
      rinkId,
      rinkData,
      date: now,
      activityType,
      duration: 60, // Default to 1 hour
      isPublic: false, // Default to private
      createdAt: now,
      updatedAt: now
    });
  }
}
