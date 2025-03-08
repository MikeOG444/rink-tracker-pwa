import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    limit: vi.fn(),
    increment: vi.fn(),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

// Mock idb library
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    add: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    transaction: vi.fn().mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        add: vi.fn(),
        getAll: vi.fn().mockReturnValue([]),
        clear: vi.fn(),
      }),
    }),
  }),
}));

// Mock IndexedDB API
global.indexedDB = {
  open: vi.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          put: vi.fn(),
          getAll: vi.fn().mockReturnValue({
            onsuccess: null,
            onerror: null,
            result: [],
          }),
          clear: vi.fn(),
        }),
        oncomplete: null,
        onerror: null,
      }),
    },
  }),
  deleteDatabase: vi.fn(),
  cmp: vi.fn(),
  databases: vi.fn().mockResolvedValue([]),
} as any;

// Define IDBRequest for idb library
global.IDBRequest = class {} as any;
global.IDBTransaction = class {} as any;
global.IDBDatabase = class {} as any;

// Mock window.navigator
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn();

// We'll clear mocks in each test file as needed
