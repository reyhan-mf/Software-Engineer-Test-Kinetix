import { Feather, BookOpen } from "../icons";

// Simple centered auth card on a soft sage gradient background, with subtle
// blog-themed watermarks (feather + open book) for a bit of character.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-linear-to-br from-[#D6DAC8] to-[#9CAFAA] p-4 sm:p-6">
      {/* Decorative background (non-interactive, hidden from screen readers) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#FBF3D5]/30 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#9CAFAA]/40 blur-3xl" />
        <Feather className="absolute -left-6 top-10 h-48 w-48 -rotate-12 text-white/10 sm:left-10" />
        <BookOpen className="absolute bottom-8 right-6 h-52 w-52 rotate-6 text-white/10 sm:right-16" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#FBF3D5] p-8 shadow-[0_20px_55px_-15px_rgba(60,75,70,0.5)] ring-1 ring-[#9CAFAA]/25 sm:p-9">
        <header className="mb-7">
          <h1 className="m-0 text-[1.7rem] font-semibold leading-tight tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{subtitle}</p>
        </header>

        {children}

        {footer && (
          <p className="mt-7 text-center text-sm text-stone-600">{footer}</p>
        )}
      </div>
    </div>
  );
}
