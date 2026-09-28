// Centralised runtime config, driven by Create React App's build-time
// REACT_APP_* environment variables so the same build can point at
// different backends (local, staging, docker-compose) without a rebuild
// of the source — only the .env file changes.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3002/api";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:3002";
