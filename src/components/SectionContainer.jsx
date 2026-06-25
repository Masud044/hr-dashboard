// src\components\SectionContainer.jsx
import { cn } from "../lib/constants/utils";

export const SectionContainer = ({
  children,
  className,
  variant = "full", // "full" | "constrained" | "narrow"
}) => {
  const variants = {
    full: "w-full px-1 md:px-3 lg:px-5",
    constrained: "w-full max-w-[1280px] mx-auto px-8 md:px-12 lg:px-16",
    narrow: "w-full max-w-[960px] mx-auto px-8 md:px-12 lg:px-16",
  };

  return (
    <div
      className={cn(
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};