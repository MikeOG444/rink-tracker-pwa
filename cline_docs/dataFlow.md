# Rink Tracker PWA - Data Flow

## Introduction

This document explains how data flows through the Rink Tracker application, from user interactions to data storage and back. Understanding these data flows is essential for new engineers to grasp how the different parts of the application work together.

## Core Data Flows

### Authentication Flow

1. **User Input**: User enters credentials in the `AuthPage` component
2. **Authentication Request**: Credentials are sent to Firebase Authentication
3. **Auth State Update**: `AuthContext` updates with the authenticated user
4. **Redirect**: User is redirected to the protected route
5. **Profile Loading**: User profile data is loaded from Firestore

```
User → AuthPage → Firebase Auth → AuthContext → Protected Routes → Firestore (user profile)
```

### Map and Rink Search Flow

1. **User Location**: `useUserLocation` hook gets the user's location
2. **Map Initialization**: Map is centered on the user's location
3. **Search Input**: User enters a search query in `SearchBar`
4. **Search Request**: Query is sent to Google Places API via `useRinkSearch`
5. **Results Display**: Search results are displayed on the map and in the results list
6. **Rink Selection**: User selects a rink, triggering `handleMarkerClick`
7. **Details Display**: Rink details are displayed in `RinkDetailsPanel`
8. **Visit Check**: `useVisitedRinks` checks if the user has visited the rink

```
User Location → Map → Search Query → Places API → Search Results → Rink Selection → Rink Details → Visit History
```

### Activity Logging Flow

1. **Rink Selection**: User selects a rink from the map or search results
2. **Activity Form**: User fills out activity details in the Dashboard
3. **Form Submission**: Activity is created using the `Activity` domain model
4. **Online Check**: System checks if the device is online
5. **Online Path**: Activity is saved directly to Firestore via `FirestoreActivityRepository`
6. **Offline Path**: Activity is saved to IndexedDB and queued for sync
7. **UI Update**: Dashboard is updated to show the new activity
8. **Sync Process**: When online, queued activities are synced with Firestore

```
Rink Selection → Activity Form → Domain Model → Online Check → Firestore/IndexedDB → UI Update → Sync
```

### Rink Visit Tracking Flow

1. **Activity Logging**: User logs an activity at a rink
2. **Visit Creation**: `RinkVisit` domain model is created
3. **Repository Save**: Visit is saved via `FirestoreRinkVisitRepository`
4. **User Rink Update**: `UserRink` record is created or updated
5. **Map Update**: Visited rinks are highlighted on the map
6. **Dashboard Update**: Visit history is updated in the dashboard

```
Activity Logging → RinkVisit Creation → Repository Save → UserRink Update → UI Updates
```

## Data Storage and Synchronization

### Firestore Collections

The application uses the following Firestore collections:

1. **users**: User profiles and preferences
2. **activities**: User activities at rinks
3. **rink_visits**: Records of user visits to rinks
4. **user_rinks**: Relationship between users and rinks they've visited

### Offline Storage with IndexedDB

For offline support, the application uses IndexedDB with the following object stores:

1. **offlineActivities**: Activities created while offline
2. **cachedRinks**: Cached rink data for offline use
3. **userPreferences**: User preferences that need to be available offline

### Synchronization Process

When the application detects that it's back online after being offline:

1. **Connectivity Detection**: `online` event listener triggers sync process
2. **Queue Processing**: Offline activities are retrieved from IndexedDB
3. **Conflict Resolution**: Check for conflicts with server data
4. **Batch Upload**: Activities are uploaded to Firestore in batches
5. **Cleanup**: Successfully synced items are removed from IndexedDB

## State Management

### Local Component State

Simple UI state is managed within components using React's `useState` hook:

```jsx
const [searchQuery, setSearchQuery] = useState('');
```

### Complex Feature State

More complex state is managed using custom hooks that encapsulate related state and logic:

```jsx
const { results, isSearching, error } = useRinkSearch(map, searchQuery);
```

### Application-Level State

Application-level state is managed using React Context:

```jsx
const { user, isAuthenticated } = useAuth();
```

### Domain State

Domain state (business data) is managed through repositories:

```jsx
const activities = await activityRepository.findByUserId(userId);
```

## Error Handling and Logging

### Error Flow

1. **Error Detection**: Error occurs in a component or service
2. **Error Creation**: Appropriate error class is instantiated
3. **Error Handling**: Error is passed to the `ErrorHandler` service
4. **Logging**: Error is logged via the `LoggingService`
5. **UI Feedback**: User is notified through UI components
6. **Recovery**: System attempts to recover or provides retry options

```
Error Detection → Error Creation → ErrorHandler → LoggingService → UI Feedback → Recovery
```

### Logging Flow

1. **Log Creation**: Log entry is created with level, message, and context
2. **Log Processing**: Entry is processed by the `LoggingService`
3. **Console Output**: Log is output to the console in development
4. **Storage**: Log is stored in memory for debugging
5. **Monitoring**: Critical logs are sent to monitoring service in production

```
Log Creation → LoggingService → Console/Storage/Monitoring
```

## Component Communication

### Parent-Child Communication

Components communicate with their children through props:

```jsx
<SearchBar onSearch={handleSearch} initialQuery={query} />
```

### Child-Parent Communication

Children communicate with parents through callback props:

```jsx
// In child component
props.onSearch(newQuery);
```

### Sibling Communication

Siblings communicate through their parent or through shared hooks/context:

```jsx
// Parent manages state that both children use
const [selectedRink, setSelectedRink] = useState(null);

// Pass to first child
<RinkMarkers onRinkSelect={setSelectedRink} />

// Pass to second child
<RinkDetailsPanel rink={selectedRink} />
```

## Conclusion

Understanding these data flows is crucial for effective development and debugging in the Rink Tracker application. When adding new features or fixing issues, consider how your changes will affect these established patterns.

For more detailed information about specific components of the data flow, refer to the relevant source files and the architecture documentation.
