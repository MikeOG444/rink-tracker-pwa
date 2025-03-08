# Technical Debt Refactoring Plan

## Overview
This document outlines the plan for addressing technical debt in the Rink Tracker PWA. The goal is to improve code quality, maintainability, and performance without changing functionality.

## Branches
- **Main Branch**: Production code
- **tech-debt-refactoring**: Branch for all refactoring work

## Phases and Tasks

### Phase 1: Fix Complex Methods (High Priority)

#### 1. `useUserLocation.ts` Refactoring
- [x] Extract `checkGeolocationSupport()` function (implemented as useGeolocationSupport hook)
- [x] Extract `useHardcodedLocation()` function (implemented as useTestLocation hook)
- [x] Extract `requestBrowserLocation()` function (implemented as useBrowserGeolocation hook)
- [x] Extract `compareAndUpdateLocation()` function (implemented as areLocationsSignificantlyDifferent utility)
- [x] Implement early returns to flatten nested conditionals
- [x] Create a state machine for location states (implemented with LocationState enum)

#### 2. `placesAPI.ts` Refactoring
- [x] Create `createPlacesService(map)` helper function
- [x] Extract `handlePlacesAPIResponse(results, status, resolve, reject)` function
- [x] Create `calculateMapRadius(bounds)` function
- [x] Implement `executeGooglePlacesRequest(requestFn, params)` wrapper
- [x] Add proper error typing and consistent error handling

#### 3. `MapPage.tsx` Refinement
- [x] Extract `useVisitedRinks(userId)` custom hook
- [x] Create `useMapCallbacks(map, userLocation)` hook
- [x] Extract map configuration into a separate constant
- [x] Create `MapContainer` component

#### 4. `useRinkSearch.ts` Decomposition
- [x] Create `useRinkSearchState()` hook
- [x] Create `useRinkSearchActions(map)` hook
- [x] Create `useRinkSelection(map)` hook
- [x] Extract `useDebounce` hook

#### 5. `SearchBar.tsx` Component Extraction
- [x] Extract `SearchInput` component
- [x] Extract `SearchResultsList` component
- [x] Extract `NoResultsMessage` component

### Phase 2: Domain Model Implementation (Medium Priority)

#### 1. Create Core Domain Models
- [x] Create `ActivityType.ts` enum
- [x] Create `Activity.ts` class with validation and factory methods
- [x] Create `UserRink.ts` class
- [x] Create `RinkVisit.ts` class

#### 2. Update Firestore Service
- [x] Refactor `firestore.ts` to use the new domain models
- [x] Create repository pattern implementations
- [x] Implement data mappers for Firestore <-> Domain model conversion
- [x] Integrate repositories with UI components

### Phase 3: Infrastructure Improvements (Medium Priority)

#### 1. Error Handling Strategy ✅
- [x] Create centralized `ErrorHandler` service
- [x] Implement custom error classes
- [x] Replace direct console.error calls with structured logging
- [x] Add React error boundaries

#### 2. Logging Service ✅
- [x] Implement `LoggingService` with different log levels
- [x] Add context to logs
- [x] Configure production vs development logging
- [x] Add ability to send critical logs to a monitoring service

#### 3. State Management Improvements (Deferred to Post-Merge)
- [ ] Evaluate React Context vs Redux
- [ ] Create a dedicated state slice for rink-related data
- [ ] Implement proper state normalization
- [ ] Add selectors for derived state

### Phase 4: Testing Infrastructure (Deferred to Post-Merge)

#### 1. Repository Testing
- [ ] Fix discrepancies between FirestoreUserRinkRepository tests and implementation
- [ ] Add unit tests for repositories
- [ ] Verify functionality works as expected
- [ ] Check for regressions or performance issues

#### 2. Component Tests
- [ ] Write tests for extracted components
- [ ] Test custom hooks in isolation
- [ ] Create snapshot tests for UI components

#### 3. Integration Tests
- [ ] Test interactions between components
- [ ] Test data flow
- [ ] Verify error handling paths

### Phase 5: Performance Optimization (Deferred to Post-Merge)

#### 1. Memoization Strategy
- [ ] Audit and optimize React.memo usage
- [ ] Implement useMemo for expensive calculations
- [ ] Use useCallback consistently

#### 2. Code Splitting
- [ ] Implement lazy loading for routes
- [ ] Split vendor bundles
- [ ] Analyze and optimize bundle size

#### 3. Rendering Optimization
- [ ] Implement virtualization for long lists
- [ ] Optimize re-renders with proper key usage
- [ ] Add performance monitoring

## Implementation Timeline

### Sprint 1: Foundation (1-2 weeks)
- Set up error handling and logging infrastructure
- Create core domain models
- Extract smaller components from complex ones
- Implement basic unit tests

### Sprint 2: Core Refactoring (1-2 weeks)
- Refactor useUserLocation.ts
- Refactor placesAPI.ts
- Update firestore.ts to use domain models
- Add integration tests

### Sprint 3: Advanced Refactoring (1-2 weeks)
- Refactor useRinkSearch.ts
- Implement state management improvements
- Complete component extraction
- Add performance monitoring

### Sprint 4: Optimization & Cleanup (1 week)
- Implement performance optimizations
- Complete test coverage
- Final code review and cleanup
- Documentation updates

## Progress Tracking

### Completed Tasks
- **2025-03-05**: Refactored `useUserLocation.ts` to use a state machine approach and extracted smaller, focused hooks:
  - Created `locationUtils.ts` with shared types, constants, and utility functions
  - Created `useGeolocationSupport.ts` to check browser support for geolocation
  - Created `useBrowserGeolocation.ts` to handle browser geolocation API
  - Created `useMapCenter.ts` to handle map centering functionality
  - Created `useTestLocation.ts` to provide test/hardcoded locations
  - Created `useTimeout.ts` to manage timeouts
  - Refactored main hook to use all these smaller hooks with a state machine approach

- **2025-03-05**: Refactored `placesAPI.ts` to improve modularity and error handling:
  - Created a modular structure with separate files for types, utilities, and API functions
  - Implemented proper error typing with PlacesErrorType enum
  - Created utility functions for common operations like service creation and error handling
  - Implemented a generic request wrapper for consistent error handling
  - Extracted the radius calculation logic into a separate function
  - Improved code organization and documentation

- **2025-03-05**: Refactored `useRinkSearch.ts` to decompose it into smaller, focused hooks:
  - Created `searchUtils.ts` with shared types, constants, and utility functions
  - Created `useRinkSearchState()` hook to manage search-related state
  - Created `useRinkSearchActions(map)` hook to handle search actions
  - Created `useRinkSelection(map)` hook to handle rink selection
  - Extracted `useDebounce` hook for debouncing search queries
  - Refactored main hook to use all these smaller hooks with proper separation of concerns

### In Progress
- Testing the repository implementations to ensure functionality and performance

### Completed Tasks (continued)
- **2025-03-07**: Fixed issues with domain models and offline storage:
  - Fixed bug in domain models' toObject methods to properly handle undefined id fields
  - Updated Activity, UserRink, and RinkVisit models to exclude id field when undefined
  - Fixed issue with IndexedDB storage for offline activities
  - Updated FirestoreActivityRepository to handle undefined id fields when syncing offline activities
  - Updated tests to match the implementation changes

- **2025-03-07**: Implemented rink selection feature in Dashboard:
  - Created RinkSelectionModal component for searching and selecting rinks
  - Updated Dashboard component to use the RinkSelectionModal
  - Added validation for rink selection when logging activities
  - Integrated with UserRinkRepository to track rink visits
  - Improved user experience with pre-filled activity details based on selected rink
  - Added proper error handling and validation
  
- **2025-03-07**: Fixed activity type display issue:
  - Updated getActivityTypeLabel function to display "Open Skate" instead of "Recreational Skating"
  - Fixed UI inconsistency between activity type selection and display

- **2025-03-07**: Enhanced RinkSelectionModal component:
  - Added a Search button to trigger search immediately without waiting for debounce
  - Added keyboard support to trigger search on Enter key press
  - Improved error handling and user feedback
  - Added search instructions and better status indicators
  - Enhanced logging for easier debugging
  - Fixed accessibility issue with aria-hidden and focus management
  - Added check for Google Maps API availability to prevent errors
  - Added retry button for Google Maps API loading failures
  - Improved error messages to explain the dependency on Google Maps API
  - Moved Google Maps API loading to app level with GoogleMapsContext
  - Enabled text field even when map isn't initialized
  - Added informative message when Google Maps API is loading

### Completed Tasks (continued)
- **2025-03-05**: Refactored `MapPage.tsx` to extract reusable hooks and components:
  - Created `mapConfig.ts` with map configuration constants
  - Created `useVisitedRinks.ts` hook to manage visited rinks state
  - Created `useMapCallbacks.ts` hook to handle map-related callbacks
  - Created `MapContainer.tsx` component to handle map rendering
  - Updated `useUserLocation.ts` to handle circular dependencies
  - Simplified the main component by using the extracted hooks and components

- **2025-03-05**: Refactored `SearchBar.tsx` to extract smaller, focused components:
  - Created `SearchInput` component for the search input field and clear button
  - Created `SearchResultsList` component for displaying search results
  - Created `NoResultsMessage` component for showing no results message
  - Organized components in a dedicated directory structure
  - Improved component composition and separation of concerns

- **2025-03-05**: Implemented core domain models for the application:
  - Created `ActivityType.ts` enum with categorized activity types
  - Created `Activity.ts` class with validation and factory methods
  - Created `UserRink.ts` class to represent a user's relationship with a rink
  - Created `RinkVisit.ts` class to represent a specific visit to a rink
  - Added proper TypeScript typing and validation
  - Implemented Firestore serialization/deserialization methods

- **2025-03-05**: Implemented repository pattern for domain models:
  - Created generic `Repository` and `UserRepository` interfaces
  - Created specific repository interfaces for each domain model
  - Implemented Firestore repositories for each domain model
  - Added data mapping between Firestore and domain models
  - Implemented offline support for activities
  - Added proper error handling and logging

- **2025-03-06**: Integrated repository pattern with UI components:
  - Updated `Dashboard.tsx` to use the ActivityRepository
  - Updated `useVisitedRinks.ts` hook to use the UserRinkRepository
  - Updated `RinkDetailsPanel.tsx` to use the RinkVisitRepository
  - Refactored `FirestoreActivityRepository.ts` to eliminate code duplication
  - Implemented helper methods for common operations
  - Added consistent error handling patterns
  - Improved type safety with proper TypeScript usage

- **2025-03-06**: Implemented caching for the ActivityRepository:
  - Added cache for activities by ID
  - Added cache for activities by user ID
  - Added cache for activities by rink ID
  - Added cache for activities by user ID and rink ID
  - Implemented cache invalidation when activities are saved or deleted
  - Added cache expiration to ensure data freshness
  - Optimized repository methods to check cache before fetching from Firestore

- **2025-03-06**: Implemented batch operations for repositories:
  - Updated Repository interface to include batch operation methods
  - Added findByIds method to efficiently fetch multiple entities
  - Added saveAll method to save multiple entities in a single transaction
  - Added deleteAll method to delete multiple entities in a single transaction
  - Implemented batch operations in FirestoreActivityRepository
  - Optimized cache handling for batch operations
  - Added proper error handling and logging for batch operations

- **2025-03-06**: Implemented pagination support for repositories:
  - Updated Repository interface to include pagination interfaces and methods
  - Added PaginationOptions interface for configuring page size and number
  - Added Page interface to represent paginated results with metadata
  - Implemented findAllPaginated method in all repository implementations
  - Added proper error handling and fallback for pagination operations
  - Ensured consistent behavior across all repository implementations

### Issues and Blockers
<!-- Document any issues or blockers encountered -->

### Known Issues for Future Resolution (Low Priority)

4. **Activity Type Filtering Issue**:
   - **Issue**: Filtering by activity types in the Dashboard wasn't working for most activity types
   - **Symptoms**: When selecting "Practice" filter, no activities would show up even though practice activities existed
   - **Cause**: Mismatch between activity type labels in the UI dropdown ("Practice") and the actual stored/displayed values ("Hockey Practice")
   - **Resolution**: Updated the `getActivityTypeLabel` function to return simplified labels that match the UI dropdown
   - **Status**: Fixed - implemented changes to ensure consistency between UI labels and stored/displayed values
   - **Priority**: Medium - affects usability but not core functionality
   
1. **Repository Test and Implementation Mismatches**:
   - **Issue**: There are discrepancies between the FirestoreUserRinkRepository tests and implementation:
     - Method name mismatch: Repository uses `toObject()` but tests mock `toFirestore()`
     - Result handling in `findByUserId`: Tests expect 2 results but get 0
     - Error handling in `delete` method: Returns false instead of throwing an error
   - **Impact**: These issues primarily affect tests rather than production functionality
   - **Resolution**: Marked as 'Won't Do' - to be addressed in future tech debt cleanup
   - **Priority**: Very Low - not affecting production functionality

2. **Infinite Re-rendering in Map Component**:
   - **Issue**: The map component shows "Maximum update depth exceeded" errors in the console
   - **Symptoms**: Continuous re-rendering cycles causing performance issues and rapid search query firing
   - **Possible Causes**:
     - Missing dependency arrays in useEffect hooks
     - State updates triggering additional renders
     - Circular dependencies between components
     - Lack of debounce control in search functionality
   - **Impact**: Application still functions but with degraded performance
   - **Resolution**: 
     - Increased debounce delay from 500ms to 800ms
     - Added isSearchingRef to prevent concurrent searches
     - Modified searchRinks to return a Promise for better control flow
     - Enhanced useRinkSearch to track search state and prevent duplicate searches
   - **Status**: Fixed - implemented changes to prevent rapid re-rendering and search query firing
   - **Priority**: Medium - affects performance but not core functionality

3. **Firestore Index Requirements**:
   - **Issue**: Queries in FirestoreActivityRepository require composite indexes
   - **Symptoms**: Error messages about missing indexes when querying activities
   - **Details**: The activities collection requires an index on userId (Ascending), date (Descending), and _name_ (Descending)
   - **Impact**: Prevents proper functioning of activity queries
   - **Resolution**: Created the required composite indexes in Firebase Console for activities and rink_visits collections
   - **Status**: Fixed - implemented the required indexes to ensure proper query functionality
   - **Priority**: High - blocks core functionality

## Testing Strategy
- Run existing tests after each significant change
- Add new tests for refactored components
- Manually verify functionality in the browser
- Compare behavior before and after refactoring

## Risk Mitigation
1. Make small, incremental changes
2. Commit frequently with descriptive messages
3. Test thoroughly after each change
4. Document any issues encountered
5. Revert changes if necessary
