import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Avatar from "./Avatar";
import { ChevronDown, LogOut, User } from "./icons";

// Avatar button that opens a dropdown with profile + logout (closes on outside
// click or Escape).
export default function ProfileMenu() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await api.post("/auth/logout");
    } catch {
      /* JWT is stateless — local cleanup is what matters */
    }
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1 rounded-full p-0.5 ring-offset-2 ring-offset-[#FBF3D5] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
      >
        <Avatar user={user} size="sm" />
        <ChevronDown
          className={`h-4 w-4 text-stone-500 transition-transform ${open ? "rotate-180" : ""} motion-reduce:transition-none`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-[#D6DAC8] bg-white shadow-lg"
        >
          <div className="border-b border-[#D6DAC8] px-4 py-3">
            <p className="truncate text-sm font-medium text-stone-900">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-stone-500">{user?.email}</p>
          </div>

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 transition hover:bg-[#D6DAC8]/30"
          >
            <User className="h-4 w-4 text-stone-500" />
            Your profile
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
