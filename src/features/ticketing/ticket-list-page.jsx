// src/features/ticketing/ticket-list-page.jsx
import { useMemo, useState } from "react";
import { PlusIcon, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { SectionContainer } from "@/components/SectionContainer";
import { useHasPermission } from "@/hooks/use-permission";
import { useUsers } from "@/features/user-management/queries";

import { useLookups, useTickets } from "./queries";
import TicketTable from "./components/TicketTable";
import TicketFilters from "./components/TicketFilters";
import StatsSummary from "./components/StatsSummary";
import TicketDetailSheet from "./ticket-detail-sheet";

const emptyFilters = {
  SEARCH: "",
  STATUS_ID: "",
  PRIORITY_ID: "",
  TICKET_TYPE: "",
};

export default function TicketListPage() {
  const navigate = useNavigate();
  const canCreate = useHasPermission("TICKET_CREATE");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);

  const { data: lookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const users = usersData?.data || [];

  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.ID, u.USERNAME])),
    [users]
  );

  const statusOpts = useMemo(
    () => (lookups?.statuses || []).map((s) => ({ value: String(s.STATUS_ID), label: s.STATUS_NAME })),
    [lookups]
  );
  const priorityOpts = useMemo(
    () => (lookups?.priorities || []).map((p) => ({ value: String(p.PRIORITY_ID), label: p.PRIORITY_NAME })),
    [lookups]
  );

  const { data, isLoading, isFetching, refetch } = useTickets(filters, pagination);

  const handleSearch = () => {
    setFilters(draftFilters);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleClear = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 className="text-lg md:text-xl font-semibold tracking-tight">Tickets</h1>

    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => refetch()}
        disabled={isFetching}
        className="text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        <span className="sr-only">Refresh</span>
      </Button>
      {canCreate && (
        <Button
          onClick={() => navigate("/dashboard/tickets/create")}
          
        >
          <PlusIcon size={16} />
          New Ticket
        </Button>
      )}
    </div>
  </div>
</div>

      <StatsSummary className="mb-4" />

      <div className="bg-card rounded-md shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-7">
          <TicketFilters
            draftFilters={draftFilters}
            setDraftFilters={setDraftFilters}
            onSearch={handleSearch}
            onClear={handleClear}
            statusOpts={statusOpts}
            priorityOpts={priorityOpts}
          />
        </div>

        <TicketTable
          data={data?.data || []}
          isLoading={isLoading}
          pagination={pagination}
          setPagination={setPagination}
          total={data?.total || 0}
          userMap={userMap}
          tableKey="tickets-all"
        />
      </div>

      <TicketDetailSheet />
    </SectionContainer>
  );
}