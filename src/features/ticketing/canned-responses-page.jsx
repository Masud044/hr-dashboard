// src/features/ticketing/canned-responses-page.jsx
import { PlusIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionContainer } from "@/components/SectionContainer";

import { useCannedResponses } from "./queries";
import { fmtDate } from "./lib/ticket-utils";

export default function CannedResponsesPage() {
  const navigate = useNavigate();
  const { data: responses = [], isLoading } = useCannedResponses();

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">Canned Responses</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Canned Responses</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Button onClick={() => navigate("/dashboard/tickets/canned-responses/create")}>
            <PlusIcon className="h-4 w-4" />
            New Response
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md shadow-sm p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
        ) : responses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No canned responses yet.</p>
        ) : (
          <div className="space-y-2">
            {responses.map((r) => (
              <div key={r.RESPONSE_ID} className="rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{r.TITLE}</h3>
                  <span className="text-[11px] text-muted-foreground shrink-0">{fmtDate(r.CREATED_AT)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.BODY}</p>
                {r.CATEGORY_ID && (
                  <Badge variant="secondary" className="mt-2">
                    Category #{r.CATEGORY_ID}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}