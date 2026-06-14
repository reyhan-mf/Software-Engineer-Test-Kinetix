// Simple centered auth card on a soft sage gradient background.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center overflow-y-auto bg-linear-to-br from-[#D6DAC8] to-[#9CAFAA] p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-[#FBF3D5] p-8 shadow-[0_20px_55px_-15px_rgba(60,75,70,0.5)] ring-1 ring-[#9CAFAA]/25 sm:p-9">
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
