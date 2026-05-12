export const isDemoMode =
  !import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL === 'REPLACE_WITH_VALUE';
