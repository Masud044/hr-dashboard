import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  FileWarning, 
  ArrowUpRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// ─────────────────────────────────────────────
// API BASE URL
// ─────────────────────────────────────────────
const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// GENESIS CHART COLORS (Matching project-list.jsx badges)
// ─────────────────────────────────────────────
const STATUS_COLORS = {
  RUNNING:   "#10B981", // Emerald 500
  COMPLETED: "#3B82F6", // Blue 500
  ON_HOLD:   "#F59E0B", // Amber 500
  CANCELLED: "#EF4444", // Red 500
  PENDING:   "#9CA3AF", // Gray 400 (Fallback for pending/unknown)
  UNKNOWN:   "#9CA3AF", // Gray 400
};

export default function Overview() {
  const navigate = useNavigate();

  // ── TanStack Query for Overview Data ───────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/overview`);
      return res.data?.data || null;
    },
  });

  // ── Loading State ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ── Error / Empty State ────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="p-8 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20 max-w-md mx-auto mt-12">
        <p className="font-medium">Failed to load dashboard data.</p>
        <p className="text-sm text-muted-foreground mt-1">Please check your connection or try again later.</p>
      </div>
    );
  }

  // ── Prepare data for Recharts ──────────────────────────────────────
  const chartData = (data.projectsByStatus || []).map(item => ({
    name: item.STATUS || "UNKNOWN",
    value: item.COUNT,
  }));
  
  const totalProjects = data.counts?.TOTAL_PROJECTS || 1; // Prevent division by zero

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">
          Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your projects today.
        </p>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Total Projects" 
          value={data.counts?.TOTAL_PROJECTS || 0} 
          icon={Building2} 
          colorClass="bg-primary/10 text-primary" 
        />
        <KpiCard 
          title="Active Contractors" 
          value={data.counts?.ACTIVE_CONTRACTORS || 0} 
          icon={Users} 
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
        />
        <KpiCard 
          title="Pending Certificates" 
          value={data.counts?.PENDING_CERTS || 0} 
          icon={FileWarning} 
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400" 
        />
      </div>

      {/* ── Row 2: Chart & Compliance Alert ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Projects by Status Chart (Takes 2/3 width) */}
        <Card className="bg-card border border-border lg:col-span-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-base font-display">Projects by Status</CardTitle>
            <CardDescription>Distribution of all projects in the system</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.UNKNOWN} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      border: "1px solid var(--border)", 
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "var(--shadow-md)"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full md:w-1/2 space-y-4">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: STATUS_COLORS[item.name] || STATUS_COLORS.UNKNOWN }} 
                    />
                    {/* Replaces underscores with spaces for better readability (e.g., ON_HOLD -> ON HOLD) */}
                    <span className="text-sm font-medium text-foreground">{item.name.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-display text-foreground">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.value / totalProjects) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
              {chartData.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No project data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Alert Card (Takes 1/3 width) */}
        <Card className="bg-card border border-border border-l-4 border-l-amber-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 font-display">
              {data.counts?.PENDING_CERTS || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projects currently pending certificate uploads.
            </p>
            {/* ✅ Navigates to Projects page */}
            <button 
              onClick={() => navigate("/dashboard/projects")}
              className="mt-6 w-full border border-border hover:bg-secondary text-foreground text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 btn-lift"
            >
              Review Pending <ArrowUpRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Recent Data Tables ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Projects Table */}
        <Card className="bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-display">Recent Projects</CardTitle>
              <CardDescription>Latest 5 projects added to the system</CardDescription>
            </div>
            {/* ✅ Navigates to Projects page */}
            <button 
              onClick={() => navigate("/dashboard/projects")}
              className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-semibold text-foreground">Project Name</TableHead>
                  <TableHead className="font-semibold text-foreground hidden md:table-cell">State</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Cert Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.recentProjects || []).map((project) => (
                  <TableRow key={project.P_ID} className="group">
                    <TableCell>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.P_NAME}
                      </div>
                      <div className="text-xs text-muted-foreground">{project.P_TYPE}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {project.STATE}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Genesis Chip Style with Dark Mode Support */}
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        project.CERT_UPLOAD_STATUS === 'PENDING' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {project.CERT_UPLOAD_STATUS || 'UPLOADED'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data.recentProjects || data.recentProjects.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-sm text-muted-foreground">
                      No recent projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Contractors Table */}
        <Card className="bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-display">Recent Contractors</CardTitle>
              <CardDescription>Latest 5 contractors registered</CardDescription>
            </div>
            {/* ✅ Navigates to Contractor page */}
            <button 
              onClick={() => navigate("/dashboard/contractor")}
              className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-semibold text-foreground">Contractor</TableHead>
                  <TableHead className="font-semibold text-foreground hidden md:table-cell">Contact</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.recentContractors || []).map((contractor) => (
                  <TableRow key={contractor.CONTRATOR_ID} className="group">
                    <TableCell>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {contractor.CONTRATOR_NAME}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">{contractor.EMAIL}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {contractor.PHONE}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Genesis Chip Style with Dark Mode Support */}
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        contractor.STATUS === 1 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {contractor.STATUS === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data.recentContractors || data.recentContractors.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-sm text-muted-foreground">
                      No recent contractors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REUSABLE KPI CARD COMPONENT
// ─────────────────────────────────────────────
function KpiCard({ title, value, icon: Icon, colorClass }) {
  return (
    <Card className="bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight font-display text-foreground">
              {value}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}