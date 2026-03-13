// utils/languageSync.js
// ============================================================
// ============================================================

import axios from 'utils/axios';

/**
 * Sync the selected language with the backend (saved in user profile)
 * @param {string} language - 'ar' or 'en'
 */
export const syncLanguageWithBackend = async (language) => {
  try {
    await axios.put('/api/auth/language', { language });
  } catch (err) {
    // Non-critical — don't block the UI
    console.warn('Failed to sync language with backend:', err);
  }
};
