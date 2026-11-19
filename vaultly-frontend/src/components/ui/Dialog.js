'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

/**
 * Modal built on the native <dialog>: the browser traps focus, makes the page inert and
 * closes on Escape. We return focus to the trigger and animate in and out with CSS (.ui-dialog).
 *
 * Keep it mounted and drive it with `open`, so the exit animation can play:
 * <Dialog open={isOpen} onClose={close} title="Add expense" footer={<Button form="f" type="submit">Save</Button>}>
 *   <form id="f" onSubmit={...}>...</form>
 * </Dialog>
 * Give the first field `data-autofocus` to focus it on open.
 */
export default function Dialog({ open, onClose, title, description, footer, size = 'md', children }) {
  const ref = useRef(null);
  const returnFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const openRef = useRef(open);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
    openRef.current = open;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement;
      dialog.showModal();
      dialog.querySelector('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    // Fires for Escape, our own close() and form method="dialog". Only report it upward
    // when the parent still thinks the dialog is open.
    const handleClose = () => {
      returnFocusRef.current?.focus?.();
      if (openRef.current) onCloseRef.current?.();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.();
      }}
      className={`ui-dialog m-auto w-[calc(100%-2rem)] ${SIZES[size]} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-surface bg-surface p-0 text-ink shadow-xl`}
    >
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-h3 font-semibold text-ink">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-ui text-ink-3">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-3 hover:bg-canvas hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
      {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
    </dialog>
  );
}
