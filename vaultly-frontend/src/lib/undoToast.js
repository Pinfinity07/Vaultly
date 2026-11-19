'use client';

import toast from 'react-hot-toast';

/**
 * Shows "<message> · Undo" for `duration` ms, then runs onCommit. Undo cancels the commit
 * and runs onUndo instead. Use for deletes: hide the item first, delete it on commit.
 */
export function undoToast(message, { onCommit, onUndo, duration = 5000 }) {
  let settled = false;
  const timer = setTimeout(() => {
    settled = true;
    onCommit();
  }, duration);

  toast(
    (t) => (
      <span className="flex items-center gap-4">
        {message}
        <button
          type="button"
          onClick={() => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            toast.dismiss(t.id);
            onUndo?.();
          }}
          className="-my-1 h-8 rounded-control px-2 font-medium text-[#5eead4] hover:bg-white/10"
        >
          Undo
        </button>
      </span>
    ),
    { duration }
  );
}
