// src/features/ticketing/agent-dashboard-page.jsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Users } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionContainer } from "@/components/SectionContainer";
import { useUsers } from "@/features/user-management/queries";

import { useOpenTicketsView, useAgentWorkloadView } from "./queries";
import StatusBadge from "./components/StatusBadge";
import PriorityBadge from "./components/PriorityBadge";
import { fmtDate } from "./lib/ticket-utils";

export default function AgentDashboardPage() {
  const navigate = useNavigate();
  const goToTicket = (ticketId) => navigate(`/dashboard/tickets/${ticketId}`);
  const { data: openTickets = [], isLoading: loadingOpen } = useOpenTicketsView();
  const { data: workload = [], isLoading: loadingWorkload } = useAgentWorkloadView();
  const { data: usersData } = useUsers({ limit: 500 });

  const users = usersData?.data || [];
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.ID, u.USERNAME])), [users]);

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight">Agent Dashboard</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Agent Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Workload */}
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Users size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Agent Workload</h2>
        </div>

        {loadingWorkload ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : workload.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assigned tickets yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {workload.map((w) => (
              <div key={w.AGENT_ID} className="rounded-lg border border-border p-3.5 bg-secondary/40">
                <div className="text-sm font-semibold text-foreground truncate">
                  {userMap[w.AGENT_ID] || `Agent #${w.AGENT_ID}`}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Open</span>
                  <span className="text-sm font-bold text-foreground">{w.OPEN_TICKETS}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Overdue</span>
                  <span className={`text-sm font-bold ${w.OVERDUE_TICKETS > 0 ? "text-red-600" : "text-foreground"}`}>
                    {w.OVERDUE_TICKETS}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open tickets, overdue-sorted */}
      <div className="bg-card rounded-md shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <AlertTriangle size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Open Tickets (Overdue First)</h2>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-dashed border-border bg-secondary/60 hover:bg-secondary/60">
                <TableHead className="px-4 py-3 font-bold text-foreground">Ticket #</TableHead>
                <TableHead className="px-4 py-3 font-bold text-foreground">Subject</TableHead>
                <TableHead className="px-4 py-3 font-bold text-foreground">Agent</TableHead>
                <TableHead className="px-4 py-3 font-bold text-foreground">Priority</TableHead>
                <TableHead className="px-4 py-3 font-bold text-foreground">Status</TableHead>
                <TableHead className="px-4 py-3 font-bold text-foreground">Due</TableHead>
                <TableHead className="px-4 py-3 font-bold text-foreground">Overdue By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingOpen && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loadingOpen && openTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-sm text-muted-foreground">
                    No open tickets.
                  </TableCell>
                </TableRow>
              )}
              {!loadingOpen &&
                openTickets.map((t) => (
                  <TableRow
                    key={t.TICKET_ID}
                    onClick={() => goToTicket(t.TICKET_ID)}
                    className={`border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer ${
                      t.HOURS_OVERDUE > 0 ? "bg-red-500/5" : ""
                    }`}
                  >
                    <TableCell className="px-4 py-3 font-mono text-sm font-semibold">{t.TICKET_NUMBER}</TableCell>
                    <TableCell className="px-4 py-3 text-sm max-w-[220px] truncate" title={t.SUBJECT}>
                      {t.SUBJECT}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {t.AGENT_ID ? userMap[t.AGENT_ID] || `ID: ${t.AGENT_ID}` : "Unassigned"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <PriorityBadge priority={t.PRIORITY_NAME} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={t.STATUS_NAME} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">{fmtDate(t.DUE_DATE)}</TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {t.HOURS_OVERDUE > 0 ? (
                        <span className="text-red-600 font-semibold">{t.HOURS_OVERDUE}h</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </SectionContainer>
  );
}