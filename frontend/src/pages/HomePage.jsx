import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { LogOut } from "../components/icons";

const HomePage = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Protect the route: send unauthenticated visitors to login.
  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    // Best-effort server call; JWT is stateless so local cleanup is what matters.
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore network/endpoint errors — still log out locally */
    }
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-[#FBF3D5]">
      <header className="sticky top-0 z-10 border-b border-[#D6DAC8] bg-[#FBF3D5]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-stone-900">
            Inkwell
          </span>

          <button
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D6DAC8] bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3D5] active:scale-[0.98] motion-reduce:transition-none"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#D6DAC8] sm:p-10">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-2 text-stone-600">
            You&apos;re signed in. Your stories will live here soon.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
