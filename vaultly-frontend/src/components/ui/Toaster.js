'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

// Rendered once, from the root layout. Pages import `toast` from react-hot-toast as before.
export default function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-ink)',
          color: '#fff',
          fontSize: '14px',
          lineHeight: '20px',
          borderRadius: 'var(--radius-control)',
          padding: '10px 14px',
          maxWidth: '420px',
        },
        success: { iconTheme: { primary: '#5eead4', secondary: 'var(--color-ink)' } },
        error: { iconTheme: { primary: '#fca5a5', secondary: 'var(--color-ink)' } },
      }}
    />
  );
}
