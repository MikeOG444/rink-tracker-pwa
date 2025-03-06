# Current Task

## Current Objectives
- Begin Phase 2 of the Technical Debt Refactoring initiative
- Reference to projectRoadmap.md: "Technical Debt Refactoring"
- Current focus: Create core domain models for the application

## Context
We have successfully completed Phase 1 of our technical debt refactoring initiative, which focused on fixing complex methods and components. We have:

1. Refactored `useUserLocation.ts` to use a state machine approach and extracted smaller, focused hooks
2. Refactored `placesAPI.ts` to improve modularity and error handling
3. Refactored `useRinkSearch.ts` to decompose it into smaller, focused hooks
4. Refactored `MapPage.tsx` to extract reusable hooks and components
5. Refactored `SearchBar.tsx` to extract smaller, focused components

Now we are moving to Phase 2, which focuses on implementing a proper domain model for the application. This will help improve the code's maintainability, testability, and readability by providing a clear structure for the application's data and business logic.

## Next Steps
1. Create core domain models:
   - Create `ActivityType.ts` enum to define the types of activities users can log
   - Create `Activity.ts` class with validation and factory methods
   - Create `UserRink.ts` class to represent a user's relationship with a rink
   - Create `RinkVisit.ts` class to represent a user's visit to a rink

2. Implement the domain models:
   - Define clear interfaces and types
   - Implement validation logic
   - Add factory methods for creating instances
   - Ensure proper encapsulation of data

3. Update the Firestore service:
   - Refactor `firestore.ts` to use the new domain models
   - Create repository pattern implementations
   - Implement data mappers for Firestore <-> Domain model conversion

4. Test the domain models:
   - Verify that all functionality works as expected
   - Check for any regressions or issues
   - Ensure performance is maintained or improved

5. Update documentation:
   - Update refactoring-plan.md to track progress
   - Update currentTask.md as tasks are completed

## Related Components
- src/services/firestore.ts
- src/components/dashboard/Dashboard.tsx
- src/context/AuthContext.tsx

## Technical Considerations
- Follow domain-driven design principles
- Ensure proper separation of concerns
- Implement validation and business rules in the domain models
- Use TypeScript for type safety
- Maintain backward compatibility with existing components
- Ensure code is testable and maintainable
