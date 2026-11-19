'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Per-browser display settings. Nothing here is sent to the server.
// skipHydration keeps the server render and the first client render identical;
// PreferencesHydrator loads the saved values after mount.
export const usePreferences = create(
  persist(
    (set) => ({
      currency: 'INR',
      hideAmounts: false,
      setCurrency: (currency) => set({ currency }),
      setHideAmounts: (hideAmounts) => set({ hideAmounts }),
    }),
    { name: 'vaultly-preferences', skipHydration: true }
  )
);
