/// <reference types="vite/client" />

interface Window {
  db?: import('./db').FogDB;
  useFog?: typeof import('./store/fog').useFog;
  ingestPosition?: typeof import('./location/ingest').ingestPosition;
}
