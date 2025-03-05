# Codebase Summary

## Project Structure Overview
The Rink Tracker PWA is organized into a modular structure with clear separation of concerns:

```
src/
├── assets/         # Static assets like images and icons
├── components/     # React components organized by feature
│   ├── auth/       # Authentication-related components
│   ├── dashboard/  # User dashboard components
│   ├── layout/     # Layout components like NavBar
│   ├── map/        # Map-related components
│   └── pages/      # Page-level components
├── context/        # React context providers
├── services/       # Service modules for external APIs and data
├── styles/         # Global styles and theming
└── types/          # TypeScript type definitions
```

## Key Components and Their Interactions

### Authentication Components
- **AuthPage.tsx**: Comprehensive authentication page with login, signup, password reset, and Google sign-in
- **ProtectedRoute.tsx**: Route wrapper that requires authenticated users
- **ActionHandler.tsx**: Handles Firebase auth actions like password reset and email verification
- **PasswordResetConfirm.tsx**: UI for password reset confirmation

### Layout Components
- **NavBar.tsx**: Main navigation component with conditional rendering based on authentication state

### Map Components
- **MapPage.tsx**: Interactive map with search, geolocation, and rink markers
- **RinkDetailsPanel.tsx**: Detailed panel showing rink information and visit history

### Dashboard Components
- **Dashboard.tsx**: User dashboard for activity logging, history viewing, and profile management

### Page Components
- **HomePage.tsx**: Landing page with introduction and authentication options

### Service Modules
- **firestore.ts**: Firebase Firestore operations with offline support
- **indexedDB.ts**: Local database operations for offline functionality
- **placesAPI.ts**: Google Places API integration for rink data

## Data Flow

1. **Authentication Flow**:
   - User credentials → AuthPage → Firebase Authentication → Email verification → AuthContext → Protected Routes
   - Google sign-in → Firebase Authentication → AuthContext → Protected Routes

2. **Map Data Flow**:
   - User location/search → MapPage → Google Maps/Places API → Map display with rink markers
   - Rink selection → RinkDetailsPanel → Firestore (check visit history) → Display rink details
   - "Log Activity" action → Navigate to Dashboard with rink data

3. **Activity Logging Flow**:
   - User input → Dashboard → Online check → Firestore or IndexedDB → Activity list update
   - Offline activities → Online detection → Sync with Firestore → Update UI

4. **Rink Visit Tracking**:
   - User logs activity at rink → Firestore → Update user's visit history
   - Map displays → Firestore → Retrieve visited rinks → Display with special markers

## External Dependencies

### Firebase
- Authentication for user management with email verification
- Firestore for structured data storage
- Hosting for deployment (assumed)

### Google Maps Platform
- Maps JavaScript API for interactive map display
- Places API for rink search and detailed information
- Geolocation for user position tracking

### Material-UI (MUI)
- Component library for consistent UI elements
- Theming system for dark mode and responsive design
- Form controls, dialogs, and layout components

### Other Libraries
- React for UI components and hooks
- TypeScript for type safety and developer experience
- Vite for fast development and optimized builds
- IndexedDB (via idb) for offline data persistence

## Recent Significant Changes
- Implementation of offline mode with IndexedDB synchronization
- Enhanced Dashboard with activity filtering and sorting
- Integration of Google Maps and Places API for rink discovery
- Implementation of email verification requirement
- Addition of profile management features

## User Feedback Integration
- Dashboard design optimized for activity logging and history viewing
- Map interface enhanced for easier rink discovery
- Authentication flow improved with clear verification steps
- Offline mode added to ensure functionality without internet connection
- Activity editing and deletion capabilities added for flexibility

## Additional Documentation
- **projectRoadmap.md**: Comprehensive project goals, features, and progress tracking
- **currentTask.md**: Current development focus and detailed next steps
- **techStack.md**: Detailed technology choices and architecture decisions
