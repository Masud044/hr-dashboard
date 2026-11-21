// src/features/selection/selection-project-label.jsx
import axios from "axios";
import { Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function SelectionProjectLabel({ projectId }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project?p_id=${projectId}`);
      const d = res.data?.data;
      return Array.isArray(d)
        ? d.find((p) => Number(p.P_ID) === Number(projectId))
        : d;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return <Skeleton className="mb-2 h-5 w-48" />;
  }

  if (!project) return null;

  return (
    <div className="mb-2 flex min-w-0 items-center gap-1.5">
      <Building2
        size={16}
        className="shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span
        className="truncate text-[15px] font-semibold text-foreground"
        title={project.P_NAME}
      >
        {project.P_NAME}
      </span>
      {project.P_CODE ? (
        <span className="shrink-0 text-[13px] text-muted-foreground">
          · {project.P_CODE}
        </span>
      ) : null}
    </div>
  );
}
