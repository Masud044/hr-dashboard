import { cn } from "../lib/utils";

export const SectionContainer = ({
  children,
  className,
  planningBoard = false,
}) => {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        planningBoard
          ? "container px-2"
          : "max-w-7xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
};
