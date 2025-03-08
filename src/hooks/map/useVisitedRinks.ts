import { useState, useEffect } from 'react';
import { userRinkRepository } from '../../domain/repositories';

/**
 * Hook to fetch and manage visited rinks for a user
 * @param userId The ID of the user to fetch visited rinks for
 * @returns A set of visited rink IDs
 */
export const useVisitedRinks = (userId: string | null) => {
  const [visitedRinks, setVisitedRinks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadVisitedRinks = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the userRinkRepository to get the user's rinks
        const userRinks = await userRinkRepository.findByUserId(userId);
        
        // Extract the rink IDs from the user rinks
        const rinkIds = new Set(userRinks.map(userRink => userRink.rinkId));
        setVisitedRinks(rinkIds);
      } catch (error) {
        console.error('Error loading visited rinks:', error);
        setError(error instanceof Error ? error : new Error('Failed to load visited rinks'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVisitedRinks();
  }, [userId]);

  return {
    visitedRinks,
    isLoading,
    error
  };
};
