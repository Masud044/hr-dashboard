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
          ? "max-w-[1400px] px-5"
          : "max-w-7xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
};
