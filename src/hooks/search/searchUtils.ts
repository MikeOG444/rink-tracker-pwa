// Search state types
export enum SearchState {
  IDLE = 'idle',
  SEARCHING = 'searching',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface SearchError {
  message: string;
  originalError?: any;
}

// Default debounce delay for search
export const DEFAULT_SEARCH_DEBOUNCE_DELAY = 1500; // ms - increased from 800ms to further reduce rapid firing

// Minimum query length to trigger search
export const MIN_QUERY_LENGTH = 2;
