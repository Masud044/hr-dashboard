// src/features/authentication-v2/Login.jsx

import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthV2 } from "./use-auth-v2";

const BrandLogo = ({ className }) => (
  <svg
    className={className}
    width="42"
    height="42"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 22V10l4-3v15" />
    <path d="M8 22V5l4-3 4 3v17" />
    <path d="M16 22V10l4 3v9" />
  </svg>
);

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required"),
});

function getErrorMessage(err) {
  if (!err) return null;
  if (typeof err === "string") return err;

  const rawMessage = err.message || "";
  if (
    err instanceof TypeError ||
    /failed to fetch|networkerror|load failed/i.test(rawMessage)
  ) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  const data = err.response?.data ?? err.data ?? err;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (err.message) return err.message;

  return "Something went wrong. Please try again.";
}

export default function LoginFormV2() {
  const id = useId();
  const navigate = useNavigate();
  const { login, loginError, loginPending } = useAuthV2();
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const errorMessage = formError ?? getErrorMessage(loginError);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    const result = loginSchema.safeParse({ username, password });

    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        errors[issue.path[0]] = issue.message;
      }
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    try {
      await login(result.data);
      navigate("/dashboard");
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/10">
      
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-center p-16 relative overflow-hidden bg-[#0A0A0A] dark:bg-card border-r border-border/10">
        <div
          className="absolute inset-0 pointer-events-none text-white/5 dark:text-foreground/5 opacity-80"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-10 max-w-sm">
          <div className="flex items-center gap-3.5 text-white dark:text-foreground">
            <BrandLogo />
            <span className="font-display inline-block mt-5 font-medium tracking-[0.25em] text-lg uppercase">
              7Skies Riversoft
            </span>
          </div>

          <div>
            <h1 className="font-display text-white dark:text-foreground text-4xl font-bold leading-[1.12] tracking-tighter">
              Manage your projects with precision
            </h1>
            <p className="font-sans text-[15px] text-muted-foreground/80 dark:text-muted-foreground leading-relaxed mt-5">
              Intuitive tools. Real-time insights.
              <br />
              Better outcomes.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none bg-gradient-to-t from-[#0A0A0A] dark:from-card to-transparent" />
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-[350px]">
          
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-12 text-foreground">
            <BrandLogo />
            <span className="font-display font-medium tracking-[0.25em] text-xs uppercase">
              7Skies Riversoft
            </span>
          </div>

          {/* Form Heading */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
              Welcome back
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground">
              Log in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username Input */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`${id}-username`}
                className="font-sans text-[13px] font-medium text-muted-foreground"
              >
                Username
              </Label>
              <Input
                id={`${id}-username`}
                name="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loginPending}
                aria-invalid={!!fieldErrors.username}
                onChange={() => {
                  if (fieldErrors.username || formError) {
                    setFieldErrors((prev) => ({ ...prev, username: undefined }));
                    setFormError(null);
                  }
                }}
                className="h-10 px-3.5 placeholder:text-muted-foreground/60 shadow-2xs disabled:opacity-60"
              />
              {fieldErrors.username && (
                <p className="font-sans text-[12px] font-medium text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`${id}-password`}
                className="font-sans text-[13px] font-medium text-muted-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id={`${id}-password`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loginPending}
                  aria-invalid={!!fieldErrors.password}
                  onChange={() => {
                    if (fieldErrors.password || formError) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      setFormError(null);
                    }
                  }}
                  className="h-10 pl-3.5 pr-10 placeholder:text-muted-foreground/60 shadow-2xs disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loginPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="font-sans text-[12px] font-medium text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Error Message */}
            {!fieldErrors.username && !fieldErrors.password && errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[var(--radius)] border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 animate-in fade-in-50 duration-200"
              >
                <AlertCircle
                  size={15}
                  className="text-destructive shrink-0 mt-0.5"
                />
                <p className="font-sans text-[13px] font-medium text-destructive leading-snug">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 font-sans font-medium text-sm bg-primary text-primary-foreground rounded-[var(--radius)] shadow-xs transition-all duration-200 hover:bg-primary/90 hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-xs"
              disabled={loginPending}
              aria-busy={loginPending}
            >
              {loginPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Log in"
              )}
            </Button>

            
          </form>
        </div>
      </div>
    </div>
  );
}