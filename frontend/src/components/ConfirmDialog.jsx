import { Spinner } from "./icons";

// Lightweight confirmation modal for destructive actions (delete post/comment).
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 cursor-default bg-stone-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-[#D6DAC8]"
      >
        <h2
          id="confirm-title"
          className="m-0 text-lg font-semibold text-stone-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-xl border border-[#D6DAC8] bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] disabled:opacity-50 motion-reduce:transition-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-70 motion-reduce:transition-none"
          >
            {loading && <Spinner className="h-4 w-4 motion-safe:animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
