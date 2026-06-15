const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

// Renders a user's avatar image, or their initials on a sage circle as fallback.
export default function Avatar({ user, size = "md", className = "" }) {
  const dims = SIZES[size] || SIZES.md;
  const name = user?.name || "User";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={`${dims} shrink-0 rounded-full object-cover ring-1 ring-[#D6DAC8] ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid ${dims} shrink-0 place-items-center rounded-full bg-[#9CAFAA] font-semibold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
