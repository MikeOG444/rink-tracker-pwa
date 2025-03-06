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
- [ ] Extract `SearchInput` component
- [ ] Extract `SearchResultsList` component
- [ ] Extract `NoResultsMessage` component

### Phase 2: Domain Model Implementation (Medium Priority)

#### 1. Create Core Domain Models
- [ ] Create `ActivityType.ts` enum
- [ ] Create `Activity.ts` class with validation and factory methods
- [ ] Create `UserRink.ts` class
- [ ] Create `RinkVisit.ts` class

#### 2. Update Firestore Service
- [ ] Refactor `firestore.ts` to use the new domain models
- [ ] Create repository pattern implementations
- [ ] Implement data mappers for Firestore <-> Domain model conversion

### Phase 3: Infrastructure Improvements (Medium Priority)

#### 1. Error Handling Strategy
- [ ] Create centralized `ErrorHandler` service
- [ ] Implement custom error classes
- [ ] Replace direct console.error calls with structured logging
- [ ] Add React error boundaries

#### 2. Logging Service
- [ ] Implement `LoggingService` with different log levels
- [ ] Add context to logs
- [ ] Configure production vs development logging
- [ ] Add ability to send critical logs to a monitoring service

#### 3. State Management Improvements
- [ ] Evaluate React Context vs Redux
- [ ] Create a dedicated state slice for rink-related data
- [ ] Implement proper state normalization
- [ ] Add selectors for derived state

### Phase 4: Testing Infrastructure (Medium-Low Priority)

#### 1. Unit Testing Framework
- [ ] Set up Jest and React Testing Library
- [ ] Create test utilities
- [ ] Implement mock services

#### 2. Component Tests
- [ ] Write tests for extracted components
- [ ] Test custom hooks in isolation
- [ ] Create snapshot tests for UI components

#### 3. Integration Tests
- [ ] Test interactions between components
- [ ] Test data flow
- [ ] Verify error handling paths

### Phase 5: Performance Optimization (Low Priority)

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
- Refactoring `SearchBar.tsx` to extract smaller, focused components

### Completed Tasks (continued)
- **2025-03-05**: Refactored `MapPage.tsx` to extract reusable hooks and components:
  - Created `mapConfig.ts` with map configuration constants
  - Created `useVisitedRinks.ts` hook to manage visited rinks state
  - Created `useMapCallbacks.ts` hook to handle map-related callbacks
  - Created `MapContainer.tsx` component to handle map rendering
  - Updated `useUserLocation.ts` to handle circular dependencies
  - Simplified the main component by using the extracted hooks and components

### Issues and Blockers
<!-- Document any issues or blockers encountered -->

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
