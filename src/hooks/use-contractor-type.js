import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Fetches contractor types from GET /api/contractor-type
 * Returns: { contractorTypeOptions, isLoading, isError }
 *
 * Backend returns: [{ ID: 1, NAME: "Electrical" }, ...]
 * Mapped to:       [{ value: 1, label: "Electrical" }, ...]
 */
export function useContractorTypes() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["contractor-types"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor-type`);
      // Support both { data: [...] } and plain array responses
      return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const contractorTypeOptions = (data ?? []).map((item) => ({
    value: item.ID,
    label: item.NAME,
  }));

  return { contractorTypeOptions, isLoading, isError };
}