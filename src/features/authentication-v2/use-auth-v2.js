// src/features/authentication-v2/use-auth-v2.js

import { useCurrentUserV2, useLoginV2, useLogoutV2 } from "./queries";

export function useAuthV2() {
  const {
    data: user,
    isLoading,
    isError,
    fetchStatus,
  } = useCurrentUserV2();

  const loading = isLoading && fetchStatus !== "idle";

  // ✅ Call each mutation hook ONCE and reuse the same instance.
  const loginMutation = useLoginV2();
  const logoutMutation = useLogoutV2();

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user && !isError,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    loginPending: loginMutation.isPending,
  };
}