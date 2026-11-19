'use client';

import { useEffect } from 'react';
import { usePreferences } from '../lib/preferences';

export default function PreferencesHydrator() {
  useEffect(() => {
    usePreferences.persist.rehydrate();
  }, []);

  return null;
}
