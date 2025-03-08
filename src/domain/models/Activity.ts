import ActivityType, { getActivityTypeLabel } from './ActivityType';

/**
 * Interface representing the data structure of an Activity
 */
export interface ActivityData {
  id?: string;
  userId: string;
  rinkId: string;
  type: ActivityType;
  date: Date | string;
  duration: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 stars
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Class representing an Activity at a rink
 */
export class Activity {
  id?: string;
  userId: string;
  rinkId: string;
  type: ActivityType;
  date: Date;
  duration: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 stars
  createdAt: Date;
  updatedAt: Date;

  /**
   * Create a new Activity instance
   */
  constructor(data: ActivityData) {
    this.id = data.id;
    this.userId = data.userId;
    this.rinkId = data.rinkId;
    this.type = data.type;
    this.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    this.duration = data.duration;
    this.notes = data.notes;
    this.rating = data.rating;
    this.createdAt = typeof data.createdAt === 'string' ? new Date(data.createdAt) : (data.createdAt || new Date());
    this.updatedAt = typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : (data.updatedAt || new Date());
    
    // Validate the activity
    this.validate();
  }

  /**
   * Validate the activity data
   * @throws Error if validation fails
   */
  validate(): void {
    if (!this.userId) {
      throw new Error('Activity must have a user ID');
    }
    
    if (!this.rinkId) {
      throw new Error('Activity must have a rink ID');
    }
    
    if (!Object.values(ActivityType).includes(this.type)) {
      throw new Error(`Invalid activity type: ${this.type}`);
    }
    
    if (isNaN(this.date.getTime())) {
      throw new Error('Activity must have a valid date');
    }
    
    if (!Number.isInteger(this.duration) || this.duration <= 0) {
      throw new Error('Activity duration must be a positive integer');
    }
    
    if (this.rating !== undefined && (this.rating < 1 || this.rating > 5 || !Number.isInteger(this.rating))) {
      throw new Error('Activity rating must be an integer between 1 and 5');
    }
  }

  /**
   * Get a human-readable label for the activity type
   */
  getTypeLabel(): string {
    return getActivityTypeLabel(this.type);
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
   * Convert the activity to a plain object for storage
   */
  toObject(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      rinkId: this.rinkId,
      type: this.type,
      date: this.date.toISOString(),
      duration: this.duration,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
    
    // Only include optional fields if they're defined
    if (this.notes !== undefined) data.notes = this.notes;
    if (this.rating !== undefined) data.rating = this.rating;
    
    // Only include id if it's defined
    if (this.id) {
      data.id = this.id;
    }
    
    return data;
  }

  /**
   * Create an Activity from a Firestore document
   */
  static fromFirestore(id: string, data: any): Activity {
    return new Activity({
      id,
      userId: data.userId,
      rinkId: data.rinkId,
      type: data.type,
      date: data.date.toDate ? data.date.toDate() : new Date(data.date),
      duration: data.duration,
      notes: data.notes,
      rating: data.rating,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
    });
  }

  /**
   * Create a new Activity with default values
   */
  static create(userId: string, rinkId: string, type: ActivityType = ActivityType.RECREATIONAL_SKATING): Activity {
    const now = new Date();
    
    return new Activity({
      userId,
      rinkId,
      type,
      date: now,
      duration: 60, // Default to 1 hour
      createdAt: now,
      updatedAt: now
    });
  }
}
