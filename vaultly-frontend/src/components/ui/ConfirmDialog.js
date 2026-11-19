'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Dialog from './Dialog';
import Button from './Button';

/**
 * Replaces window.confirm(). Name the thing being changed in the title.
 * <ConfirmDialog open title="Delete Goa trip?" description confirmLabel="Delete goal" onConfirm onCancel />
 * onConfirm may return a promise; the button shows a spinner until it settles.
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onCancel?.()}
      title={title}
      size="sm"
      footer={
        <>
          {/* Destructive confirms open with focus on Cancel, so Enter never deletes by accident. */}
          <Button variant="ghost" onClick={onCancel} disabled={busy} data-autofocus={tone === 'danger' || undefined}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={busy}
            data-autofocus={tone !== 'danger' || undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-body text-ink-2">{description}</p>}
    </Dialog>
  );
}

const ConfirmContext = createContext(null);

/** One shared ConfirmDialog for the app, rendered from the root layout. */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    resolveRef.current?.(false);
    setRequest(options);
    setOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={open}
        {...request}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * const confirm = useConfirm();
 * if (!(await confirm({ title: 'Delete Goa trip?', confirmLabel: 'Delete goal' }))) return;
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider');
  return confirm;
}
