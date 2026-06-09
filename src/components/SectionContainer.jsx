import { cn } from "../lib/constants/utils";


export const SectionContainer = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
      " w-full px-2", className
      )}
    >
      {children}
    </div>
  );
};
