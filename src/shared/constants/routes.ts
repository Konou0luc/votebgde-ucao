const rawPath = import.meta.env.VITE_ADMIN_PATH || '/console-vbgde-9f3a'
export const ADMIN_PRIVATE_PATH = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
