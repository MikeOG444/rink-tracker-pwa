# Rink Tracker PWA - Architecture Overview

## Introduction

This document provides a high-level overview of the Rink Tracker PWA architecture. It's designed to help new engineers understand the system's structure, key components, and design decisions.

## Architectural Style

Rink Tracker follows a **layered architecture** with clear separation of concerns:

1. **Presentation Layer**: React components and hooks
2. **Domain Layer**: Business logic, domain models, and repositories
3. **Data Layer**: Firebase services, local storage, and external APIs

The application also incorporates elements of **Domain-Driven Design (DDD)** with a focus on creating a rich domain model that encapsulates business rules and validation logic.

## Key Components

### Presentation Layer

#### React Components
- **Pages**: Top-level components that represent entire screens (e.g., `MapPage`, `Dashboard`)
- **Layout Components**: Structural components like `NavBar` that define the application's layout
- **Feature Components**: Reusable components specific to a feature (e.g., `RinkMarkers`, `SearchBar`)
- **UI Components**: Generic UI elements that can be used across features

#### React Hooks
- **Feature Hooks**: Encapsulate feature-specific logic (e.g., `useRinkSearch`, `useVisitedRinks`)
- **Utility Hooks**: Provide reusable functionality (e.g., `useDebounce`, `useTimeout`)
- **Domain Hooks**: Interface with the domain layer (e.g., hooks that use repositories)

### Domain Layer

#### Domain Models
- **Entity Models**: Core business objects with identity (e.g., `Activity`, `UserRink`, `RinkVisit`)
- **Value Objects**: Immutable objects without identity (e.g., `ActivityType`)
- **Factories**: Methods for creating valid domain objects

#### Repositories
- **Repository Interfaces**: Define contracts for data access (e.g., `ActivityRepository`)
- **Repository Implementations**: Concrete implementations for different data sources (e.g., `FirestoreActivityRepository`)

### Data Layer

#### Firebase Services
- **Authentication**: User authentication and management
- **Firestore**: NoSQL database for storing application data
- **Cloud Functions**: Serverless functions for backend logic (future)

#### Local Storage
- **IndexedDB**: Browser database for offline support
- **LocalStorage**: Simple key-value storage for user preferences

#### External APIs
- **Google Maps API**: For map display and location services
- **Google Places API**: For rink search and information

## Cross-Cutting Concerns

### Error Handling
- **Error Classes**: Hierarchy of custom error classes for different error types
- **ErrorHandler**: Centralized service for consistent error handling
- **Error Boundaries**: React components for graceful UI error handling

### Logging
- **LoggingService**: Structured logging with different log levels
- **Context-aware Logging**: Logs include context information for better debugging
- **Production vs. Development**: Different logging behavior based on environment

### Authentication
- **AuthContext**: React context for authentication state
- **ProtectedRoute**: Component for securing routes that require authentication
- **ActionHandler**: Component for handling auth-related actions (password reset, email verification)

## Data Flow

1. **User Interaction**: User interacts with a React component
2. **Component Logic**: Component uses hooks to handle the interaction
3. **Domain Logic**: Hooks use domain models and repositories
4. **Data Access**: Repositories interact with Firebase or local storage
5. **State Update**: Data flows back to the UI through hooks and state

## Key Design Decisions

### Repository Pattern
We use the repository pattern to abstract data access logic from the rest of the application. This provides several benefits:
- **Testability**: Repositories can be easily mocked for testing
- **Flexibility**: We can change data sources without affecting business logic
- **Separation of Concerns**: Data access logic is isolated from business logic

### React Hooks for State Management
We use custom React hooks for state management instead of a global state library. This approach:
- **Simplifies Component Logic**: Components only need to use hooks
- **Improves Reusability**: Hooks can be composed and reused
- **Reduces Boilerplate**: Less code compared to Redux or similar libraries

### Offline-First Approach
The application is designed to work offline first, with data syncing when online:
- **IndexedDB**: Stores data locally for offline access
- **Sync Mechanism**: Syncs local data with Firestore when online
- **Optimistic UI**: Updates UI immediately, then syncs in the background

### Domain-Driven Design
We follow DDD principles to create a rich domain model:
- **Encapsulated Validation**: Domain models validate their own data
- **Business Rules**: Business rules are part of the domain model
- **Factory Methods**: Factory methods ensure valid object creation

## Future Architectural Considerations

### State Management Evolution
As the application grows, we may need to evaluate more robust state management solutions:
- **React Context vs. Redux**: Evaluate which approach better suits our needs
- **State Normalization**: Implement proper state normalization to avoid duplication
- **Selectors for Derived State**: Add selectors for computing derived state

### Performance Optimizations
- **Memoization**: Use React.memo, useMemo, and useCallback more consistently
- **Code Splitting**: Implement lazy loading for routes and components
- **Virtualization**: Use virtualization for long lists

### Testing Infrastructure
- **Unit Testing**: Expand unit test coverage for repositories and domain models
- **Component Testing**: Add tests for React components and hooks
- **Integration Testing**: Test interactions between components and services

## Conclusion

The Rink Tracker PWA architecture is designed to be modular, maintainable, and scalable. By following clear separation of concerns and established design patterns, we've created a foundation that can evolve with the application's needs.

New engineers should focus on understanding the domain models, repositories, and how they interact with the React components and hooks. This understanding will provide a solid foundation for contributing to the project.
