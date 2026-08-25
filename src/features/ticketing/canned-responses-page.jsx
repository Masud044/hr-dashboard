// src/features/ticketing/canned-responses-page.jsx
import { Pencil, PlusIcon, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

import { useCannedResponses, useDeleteCannedResponse } from "./queries";
import { fmtDate } from "./lib/ticket-utils";

export default function CannedResponsesPage() {
  const navigate = useNavigate();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const { data: responses = [], isLoading } = useCannedResponses();
  const deleteCannedResponse = useDeleteCannedResponse();

  const handleEdit = (responseId) => {
    navigate(`/dashboard/tickets/canned-responses/${responseId}/edit`);
  };

  const handleDelete = async (r) => {
    const confirmed = await showConfirmation({
      title: "Delete canned response?",
      description: `This will permanently delete "${r.TITLE}". This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      await deleteCannedResponse.mutateAsync(r.RESPONSE_ID);
      toast.success("Canned response deleted.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete canned response.");
    }
  };

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
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground">{fmtDate(r.CREATED_AT)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${r.TITLE}`}
                      onClick={() => handleEdit(r.RESPONSE_ID)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${r.TITLE}`}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={deleteCannedResponse.isPending}
                      onClick={() => handleDelete(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.BODY}</p>
                {r.CATEGORY_NAME && (
  <Badge variant="secondary" className="mt-2">
    {r.CATEGORY_NAME}
  </Badge>
)}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog />
    </SectionContainer>
  );
}