// src/features/worker-attendance/report-queries.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const attendanceReportQueryKeys = {
  all: ["attendance-reports"],
  daily: (filters) => [...attendanceReportQueryKeys.all, "daily", filters],
  workers: () => [...attendanceReportQueryKeys.all, "workers"],
  projects: () => [...attendanceReportQueryKeys.all, "projects"],
};

export const getDailyMoneyReport = async (filters) => {
  const params = new URLSearchParams();
  if (filters.from_date) params.append("from_date", filters.from_date);
  if (filters.to_date) params.append("to_date", filters.to_date);
  if (filters.worker_id) params.append("worker_id", filters.worker_id);
  if (filters.project_id) params.append("project_id", filters.project_id);
  params.append("format", "json");

  const res = await axios.get(`${url}/api/worker-attendance/reports/daily?${params.toString()}`);
  return res.data;
};

export const downloadReportExport = async (filters, format) => {
  const params = new URLSearchParams();
  if (filters.from_date) params.append("from_date", filters.from_date);
  if (filters.to_date) params.append("to_date", filters.to_date);
  if (filters.worker_id) params.append("worker_id", filters.worker_id);
  if (filters.project_id) params.append("project_id", filters.project_id);
  params.append("format", format);

  const res = await axios.get(`${url}/api/worker-attendance/reports/daily?${params.toString()}`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  
  // Extract filename from Content-Disposition if available, else fallback to standard pattern
  const disposition = res.headers["content-disposition"];
  let filename = `daily-report-${filters.from_date}-to-${filters.to_date}.${format}`;
  if (disposition && disposition.indexOf("filename=") !== -1) {
    filename = disposition.replace(/^.*filename="?"?([^";]+)"?;?$/, "$1");
  }
  
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

const getWorkers = async () => {
  const res = await axios.get(`${url}/api/worker`);
  return res.data?.data || [];
};

const getProjects = async () => {
  const res = await axios.get(`${url}/api/project`);
  return res.data?.data || [];
};

export const useDailyMoneyReport = (filters) => {
  return useQuery({
    queryKey: attendanceReportQueryKeys.daily(filters),
    queryFn: () => getDailyMoneyReport(filters),
    enabled: !!filters.from_date && !!filters.to_date,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
};

export const useWorkers = () => {
  return useQuery({
    queryKey: attendanceReportQueryKeys.workers(),
    queryFn: getWorkers,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: attendanceReportQueryKeys.projects(),
    queryFn: getProjects,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
};