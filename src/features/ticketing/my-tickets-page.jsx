// src/features/ticketing/my-tickets-page.jsx
import { useMemo, useState } from "react";
import { PlusIcon, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionContainer } from "@/components/SectionContainer";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useUsers } from "@/features/user-management/queries";

import { useLookups, useTickets } from "./queries";
import TicketTable from "./components/TicketTable";
import TicketFilters from "./components/TicketFilters";
import TicketDetailSheet from "./ticket-detail-sheet";

const emptyFilters = {
  STATUS_ID: "",
  PRIORITY_ID: "",
  CATEGORY_ID: "",
};

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuthV2();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const { data: lookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const users = usersData?.data || [];
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.ID, u.USERNAME])), [users]);

  const statusOpts = useMemo(
    () => (lookups?.statuses || []).map((s) => ({ value: String(s.STATUS_ID), label: s.STATUS_NAME })),
    [lookups]
  );
  const priorityOpts = useMemo(
    () => (lookups?.priorities || []).map((p) => ({ value: String(p.PRIORITY_ID), label: p.PRIORITY_NAME })),
    [lookups]
  );
  const categoryOpts = useMemo(
    () => (lookups?.categories || []).map((c) => ({ value: String(c.CATEGORY_ID), label: c.CATEGORY_NAME })),
    [lookups]
  );

  // Fixed to the current user — not user-editable.
  const filters = { ...appliedFilters, REQUESTED_FOR: user?.id };

  const { data, isLoading, isFetching, refetch } = useTickets(filters, pagination);

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleClear = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">My Tickets</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Tickets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button
              onClick={() => navigate("/dashboard/tickets/create")}
              className="h-10 rounded-full gap-2 font-bold text-primary-dark bg-gradient-to-b from-accent-light via-accent to-accent-dark shadow-accent-glow hover:brightness-105 transition-transform active:scale-95"
            >
              <PlusIcon size={16} />
              New Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-md shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-5">
          <TicketFilters
            draftFilters={draftFilters}
            setDraftFilters={setDraftFilters}
            onSearch={handleSearch}
            onClear={handleClear}
            statusOpts={statusOpts}
            priorityOpts={priorityOpts}
            categoryOpts={categoryOpts}
            showAgentFilter={false}
          />
        </div>

        <TicketTable
          data={data?.data || []}
          isLoading={isLoading}
          pagination={pagination}
          setPagination={setPagination}
          total={data?.total || 0}
          userMap={userMap}
          showAgentColumn={false}
          tableKey="tickets-my"
        />
      </div>

      <TicketDetailSheet />
    </SectionContainer>
  );
}