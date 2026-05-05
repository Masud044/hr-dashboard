import { cn } from "../lib/constants/utils";


export const SectionContainer = ({
  children,
  
}) => {
  return (
    <div
      className={cn(
      " w-full px-2"
      )}
    >
      {children}
    </div>
  );
};
