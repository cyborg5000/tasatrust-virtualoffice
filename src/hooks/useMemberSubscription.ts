import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Subscription = Tables<"subscriptions">;

interface UseMemberSubscriptionResult {
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const VALID_TIERS = new Set(["basic", "essential", "professional"]);

export function useMemberSubscription(userId?: string): UseMemberSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("member_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading member subscription:", error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasActiveSubscription = Boolean(
    subscription &&
      subscription.status === "active" &&
      VALID_TIERS.has(subscription.tier)
  );

  return { subscription, hasActiveSubscription, loading, refresh };
}
