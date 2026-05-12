import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMemberSubscription } from "@/hooks/useMemberSubscription";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
  onlyWithoutSubscription?: boolean;
}

export function ProtectedRoute({
  children,
  requireSubscription = false,
  onlyWithoutSubscription = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const {
    effectiveMemberId,
    isViewingAsMember,
    loading: adminMemberViewLoading,
  } = useAdminMemberView();
  const location = useLocation();
  const shouldCheckSubscription = requireSubscription || onlyWithoutSubscription;
  const { hasActiveSubscription, loading: subscriptionLoading } = useMemberSubscription(
    shouldCheckSubscription && !adminMemberViewLoading ? effectiveMemberId : undefined,
    { reconcileProfile: !isViewingAsMember },
  );

  if (loading || adminMemberViewLoading || (shouldCheckSubscription && subscriptionLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSubscription && !hasActiveSubscription) {
    return <Navigate to="/member/onboarding" state={{ from: location }} replace />;
  }

  if (onlyWithoutSubscription && hasActiveSubscription) {
    return <Navigate to="/member" replace />;
  }

  return <>{children}</>;
}
