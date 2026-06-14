import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "../icons";

// Accessible text field: label tied to input, leading icon, optional password
// reveal toggle, helper text, and inline error with role="alert".
export default function Field({
  id,
  label,
  type = "text",
  icon: Icon,
  error,
  helperText,
  revealable = false,
  required = false,
  ...inputProps
}) {
  const [show, setShow] = useState(false);
  const inputType = revealable ? (show ? "text" : "password") : type;

  const describedBy =
    [error ? `${id}-error` : null, helperText && !error ? `${id}-help` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-stone-700"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        )}

        <input
          id={id}
          type={inputType}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            "h-11 w-full rounded-xl border bg-white text-base text-stone-900 outline-none transition placeholder:text-stone-400",
            Icon ? "pl-10" : "pl-4",
            revealable ? "pr-12" : "pr-4",
            "focus-visible:ring-2 motion-reduce:transition-none",
            error
              ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
              : "border-[#D6DAC8] focus-visible:border-[#9CAFAA] focus-visible:ring-[#9CAFAA]/40",
          ].join(" ")}
          {...inputProps}
        />

        {revealable && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-stone-400 transition hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {helperText && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-stone-600">
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
