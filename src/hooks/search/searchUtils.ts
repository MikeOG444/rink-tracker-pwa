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
export const DEFAULT_SEARCH_DEBOUNCE_DELAY = 500; // ms

// Minimum query length to trigger search
export const MIN_QUERY_LENGTH = 2;
