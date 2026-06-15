import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Spinner } from "../icons";

// Google's official multi-color "G" mark.
const GoogleGIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Custom-styled Google sign-in button + divider. Uses the implicit OAuth flow to
// get an access token, which the backend verifies (audience check) and exchanges
// for our own JWT — so the rest of the app treats it like any other login.
const GoogleAuthButton = ({ onError }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      onError?.("");
      setLoading(true);
      try {
        const res = await api.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });
        login(res.data.user, res.data.token);
        navigate("/");
      } catch (err) {
        onError?.(
          err.response?.data?.message ||
            "Google sign-in failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => onError?.("Google sign-in was cancelled or failed."),
  });

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => googleLogin()}
        disabled={loading}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3D5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
      >
        {loading ? (
          <Spinner className="h-4 w-4 motion-safe:animate-spin" />
        ) : (
          <GoogleGIcon className="h-5 w-5" />
        )}
        {loading ? "Signing in…" : "Continue with Google"}
      </button>

      <div className="mt-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
          or
        </span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
