/**
 * API Base URL
 * Same-origin (Render): ''  (relative)
 * Different origin (static deploy): full Render URL
 */
const RENDER_URL = 'https://gri-lj64.onrender.com';

export const API_BASE: string =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' &&
  !window.location.hostname.includes('onrender.com')
    ? RENDER_URL
    : '';
