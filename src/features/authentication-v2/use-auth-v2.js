// src/features/authentication-v2/use-auth-v2.js

import { useCurrentUserV2, useLoginV2, useLogoutV2 } from "./queries";

export function useAuthV2() {
  const {
    data: user,
    isLoading,
    isError,
    fetchStatus,           // ✅ যোগ করো
  } = useCurrentUserV2();

  const loading = isLoading && fetchStatus !== "idle"; // ✅ সঠিক loading check

  return {
    user,
    isLoading: loading,    // ✅ এটা return করো
    isAuthenticated: !!user && !isError,
    login:      useLoginV2().mutateAsync,
    logout:     useLogoutV2().mutate,
    loginError: useLoginV2().error,
    loginPending: useLoginV2().isPending,
  };
}