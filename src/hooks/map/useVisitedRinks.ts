import { useState, useEffect } from 'react';
import { getUserVisitedRinks } from '../../services/firestore';

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
        const rinks = await getUserVisitedRinks(userId);
        const rinkIds = new Set(rinks.map(rink => rink.id));
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
