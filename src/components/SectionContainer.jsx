import { cn } from "../lib/utils";

export const SectionContainer = ({
  children,
  
}) => {
  return (
    <div
      className={cn(
      " w-full"
      )}
    >
      {children}
    </div>
  );
};
