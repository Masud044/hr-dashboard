// src/features/authentication-v2/Login.jsx

import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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

export default function LoginFormV2() {
  const id = useId();
  const navigate = useNavigate();
  const { login, loginError, loginPending } = useAuthV2();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();
    try {
      await login({ username, password });
      navigate("/dashboard");
      // eslint-disable-next-line no-empty, no-unused-vars
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/10">
      
      {/* ── Left panel (Quietly Confident Editorial Space) ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-center p-16 relative overflow-hidden bg-[#0A0A0A] dark:bg-card border-r border-border/10">
        
        {/* Structural Dot Grid using system colors */}
        <div
          className="absolute inset-0 pointer-events-none text-white/5 dark:text-foreground/5 opacity-80"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Content Grouped with Balanced Breathing Room */}
        <div className="relative z-10 flex flex-col gap-10 max-w-sm">
          {/* Logo Brand Container */}
          <div className="flex items-center gap-3.5 text-white dark:text-foreground">
            <BrandLogo />
            <span className="font-display inline-block mt-5 font-medium tracking-[0.25em] text-lg uppercase">
              REVINNS
            </span>
          </div>

          {/* Core Typography Message */}
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

        {/* Smooth layout masking blend */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none bg-gradient-to-t from-[#0A0A0A] dark:from-card to-transparent" />
      </div>

      {/* ── Right panel (Framed Interface Space) ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-[350px]">
          
          {/* Responsive Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-12 text-foreground">
            <BrandLogo />
            <span className="font-display font-medium tracking-[0.25em] text-xs uppercase">
              REVINNS
            </span>
          </div>

          {/* Form Architectural Heading */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
              Welcome back
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          {/* Functional Layout Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input Field */}
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
                required
                disabled={loginPending}
                className="h-10 px-3.5 bg-card border-border text-foreground placeholder:text-muted-foreground/40 rounded-[var(--radius)] shadow-2xs transition-colors duration-150 focus-visible:border-primary"
              />
            </div>

            {/* Password Input Field */}
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
                  required
                  disabled={loginPending}
                  className="h-10 pl-3.5 pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground/40 rounded-[var(--radius)] shadow-2xs transition-colors duration-150 focus-visible:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error Message Space */}
            {loginError && (
              <p className="font-sans text-[13px] font-medium text-destructive animate-in fade-in-50 duration-200">
                {loginError.message}
              </p>
            )}

            {/* Precision Submit CTA */}
            <Button
              type="submit"
              className="w-full h-10 font-sans font-medium text-sm bg-primary text-primary-foreground rounded-[var(--radius)] shadow-xs transition-all duration-200 hover:bg-primary/90 hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0"
              disabled={loginPending}
            >
              {loginPending ? "Signing in…" : "Sign in"}
            </Button>

            {/* Inline Password Reset Link */}
            <div className="text-center pt-1.5">
              <a
                href="#"
                className="font-sans text-[13px] font-medium text-primary hover:text-primary/90 transition-colors inline-block relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-primary/50 after:transition-all"
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}