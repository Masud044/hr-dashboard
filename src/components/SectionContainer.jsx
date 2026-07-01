import { cn } from "@/lib/utils";

// src\components\SectionContainer.jsx
export const SectionContainer = ({
  children,
  className,
  variant = "full", // "full" | "constrained" | "narrow" | "dashboard"
}) => {
  const variants = {
    full: "w-full px-4 md:px-6 lg:px-8",
    constrained: "w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8",
    narrow: "w-full max-w-[960px] mx-auto px-4 md:px-6 lg:px-8",
    dashboard: "w-full px-4 py-6", // Less padding for sidebar layouts
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};