# Firestore Database Schema and Security Rules

This document outlines the collections, document structures, and access patterns for the Rink Tracker application's Firestore database.

## Collections Overview

| Collection | Purpose | Access Pattern |
|------------|---------|----------------|
| `activities` | Stores user activity logs at rinks | User can only access their own activities |
| `rinks` | Stores information about skating rinks | Public read, authenticated create/update |
| `user_rinks` | Stores relationships between users and rinks | User can only access their own relationships |
| `rink_visits` | Stores detailed visit information | User can access their own visits, public visits are readable by anyone |

## Collection Details

### activities

**Purpose**: Track user activities at rinks (games, practices, open skates, etc.)

**Document ID**: Auto-generated

**Fields**:
- `userId` (string): The ID of the user who created the activity
- `rinkId` (string): The ID of the rink where the activity took place
- `type` (string): The type of activity (e.g., HOCKEY_GAME, RECREATIONAL_SKATING)
- `date` (timestamp): When the activity occurred
- `duration` (number): Duration in minutes
- `notes` (string, optional): User notes about the activity
- `rating` (number, optional): User rating (1-5)
- `createdAt` (timestamp): When the record was created
- `updatedAt` (timestamp): When the record was last updated

**Security Rules**:
- Create: Authenticated user can create their own activities
- Read/Update/Delete: Only the owner can read, update, or delete their activities

### rinks

**Purpose**: Store information about skating rinks

**Document ID**: Matches the place ID from Google Places API

**Fields**:
- `id` (string): The rink ID (same as document ID)
- `name` (string): The name of the rink
- `address` (string): The address of the rink
- `position` (object): Geographic coordinates
  - `lat` (number): Latitude
  - `lng` (number): Longitude
- `photo` (string, optional): URL to a photo of the rink
- `rating` (number, optional): Average rating
- `createdAt` (timestamp): When the record was created
- `updatedAt` (timestamp): When the record was last updated

**Security Rules**:
- Create/Update: Any authenticated user can create or update rink information
- Read: Public (anyone can read)
- Delete: Not allowed (admin-only operation)

### user_rinks

**Purpose**: Track user interactions with rinks (visits, favorites)

**Document ID**: Format is `{userId}_{rinkId}`

**Fields**:
- `userId` (string): The user ID
- `rinkId` (string): The rink ID
- `isFavorite` (boolean): Whether the user has favorited this rink
- `visitCount` (number): Number of times the user has visited this rink
- `lastVisitDate` (timestamp, optional): Date of the last visit
- `hasVerifiedVisit` (boolean): Whether the user has a verified visit (was physically at the rink)
- `notes` (string, optional): User notes about this rink
- `createdAt` (timestamp): When the record was created
- `updatedAt` (timestamp): When the record was last updated

**Security Rules**:
- Create: Authenticated user can create their own user_rink documents
- Read/Update/Delete: User can only access their own user_rink documents

### rink_visits

**Purpose**: Store detailed information about rink visits

**Document ID**: Auto-generated

**Fields**:
- `userId` (string): The user ID
- `rinkId` (string): The rink ID
- `date` (timestamp): When the visit occurred
- `activityType` (string): The type of activity during the visit
- `isPublic` (boolean): Whether this visit is publicly visible
- `photos` (array, optional): Array of photo URLs
- `rating` (number, optional): User rating for this visit (1-5)
- `notes` (string, optional): User notes about this visit
- `createdAt` (timestamp): When the record was created
- `updatedAt` (timestamp): When the record was last updated

**Security Rules**:
- Create: Authenticated user can create their own visit records
- Read: Owner can read their own visits, public visits are readable by anyone
- Update/Delete: Only the owner can update or delete their visits

## When to Update Security Rules

Security rules should be reviewed and potentially updated when:

1. **Adding new collections**: Any new collection needs appropriate security rules
2. **Changing document structure**: If you add/remove/modify fields that are used in security rules
3. **Changing access patterns**: If you change who should have access to what data
4. **Adding new features**: Features that change how data is accessed or stored

## Indexes

The application uses the following composite indexes to optimize query performance:

### rink_visits Collection
- Index on:
  - `rinkId` (Ascending)
  - `userId` (Ascending)
  - `date` (Descending)
  - `__name__` (Descending)
- This index optimizes queries that filter by rink and user, and sort by date.

### activities Collection
- Index on:
  - `userId` (Ascending)
  - `date` (Descending)
  - `__name__` (Descending)
- This index optimizes queries that filter by user and sort by date.

These indexes are defined in the `firestore.indexes.json` file and should be deployed along with the security rules.

## Testing Security Rules

Before deploying updated security rules, test them to ensure they:
1. Allow legitimate access patterns
2. Block unauthorized access
3. Don't break existing functionality

Use the Firebase Emulator Suite for testing security rules locally before deployment.
