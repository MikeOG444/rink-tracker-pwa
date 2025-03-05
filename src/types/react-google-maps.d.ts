import { } from '@react-google-maps/api';

declare module '@react-google-maps/api' {
  export type Library = 'places' | 'drawing' | 'geometry' | 'visualization' | 'localContext';
}
