import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { db } from './db';
import { useFog } from './store/fog';
import { ingestPosition } from './location/ingest';

// Expose utilities on window during development for browser console testing
if (import.meta.env.DEV) {
  window.db = db;
  window.useFog = useFog;
  window.ingestPosition = ingestPosition;
}

// Request persistent storage so browser is less likely to evict Dexie IndexedDB media
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
