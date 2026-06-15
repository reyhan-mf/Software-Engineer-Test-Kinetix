import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import AuthShell from "../components/auth/AuthShell";
import Field from "../components/auth/Field";
import { Mail, Lock, Spinner, ArrowRight, AlertCircle } from "../components/icons";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!emailRe.test(formData.email))
      next.email = "Enter a valid email address";
    if (!formData.password) next.password = "Password is required";
    return next;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  
  const handleBlur = (e) => {
    const { id } = e.target;
    setErrors((prev) => ({ ...prev, [id]: validate()[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-stone-700 underline-offset-2 hover:text-stone-900 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field
          id="email"
          name="email"
          label="Email"
          type="email"
          icon={Mail}
          required
          autoFocus
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
        />

        <Field
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          revealable
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D6A99D] px-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3D5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4 motion-safe:animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default LoginForm;
