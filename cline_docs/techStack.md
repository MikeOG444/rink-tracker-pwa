# Technology Stack

## Frontend Framework
- React with TypeScript
- Vite (build tool and development server)
- Material-UI (MUI) component library

## Styling and UI
- Material-UI theming system (src/styles/theme.ts)
- Custom component styling with MUI's sx prop
- Dark mode design with high contrast for readability
- Responsive design for all device sizes

## State Management
- React Context API (src/context/AuthContext.tsx)
- Local component state with React hooks
- URL state for passing data between components (e.g., from map to dashboard)

## Authentication and Backend
- Firebase Authentication
  - Email/password authentication with email verification
  - Google sign-in integration
  - Password reset functionality
  - Protected routes for authenticated content

## Database and Storage
- Firebase Firestore (NoSQL database)
  - Real-time data synchronization
  - Structured collections for activities, rinks, and user data
- IndexedDB for offline data persistence
  - Activity storage when offline
  - Synchronization with Firestore when back online

## Maps and Geolocation
- Google Maps JavaScript API
  - Interactive map display
  - Custom markers for rinks and user location
- Google Places API
  - Rink search functionality
  - Detailed rink information
- Geolocation for user position tracking
- Custom map components for rink visualization

## Progressive Web App Features
- Offline functionality with IndexedDB
- Online/offline state detection and handling
- Responsive design for all screen sizes
- Installable on devices (PWA manifest)

## Development Tools
- ESLint for code quality
- TypeScript for type safety and improved developer experience
- Vite for fast development and optimized builds

## Deployment
- Firebase Hosting (assumed based on Firebase usage)

## Architecture Decisions

### Component Structure
- Page components for main routes (HomePage, MapPage, etc.)
- Feature-specific components organized by functionality (auth, dashboard, map)
- Reusable UI components for consistent interface elements
- Layout components for consistent UI structure (NavBar)

### Data Flow
- Firebase services for backend communication (firestore.ts)
- Context providers for global state (AuthContext)
- Props for component-specific data
- Custom hooks for reusable logic
- Event-based communication for cross-component updates

### Authentication Flow
- Firebase Authentication for user management
- Email verification requirement before dashboard access
- Protected routes for authenticated content
- Action handler for password reset and other auth operations
- Google authentication as alternative sign-in method

### Offline Strategy
- IndexedDB for local data storage
- Online/offline state detection
- Automatic synchronization when connection is restored
- Visual indicators for offline mode and pending synchronization
- Conflict resolution for offline edits

### Map Integration
- Google Maps for base map functionality
- Custom markers for visited vs. non-visited rinks
- Search functionality for finding rinks by name or location
- Detailed panels for rink information
- Integration with dashboard for activity logging
