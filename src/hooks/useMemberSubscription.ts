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
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      setResolvedUserId(undefined);
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
        .limit(1);

      if (error) {
        console.error("Error loading member subscription:", error);
        setSubscription(null);
      } else {
        setSubscription(data?.[0] || null);
      }
    } finally {
      setLoading(false);
      setResolvedUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`member-subscription-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `member_id=eq.${userId}`,
        },
        () => {
          void refresh();
        }
      )
      .subscribe();

    const handleFocus = () => {
      void refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const hasActiveSubscription = Boolean(
    subscription &&
      subscription.status === "active" &&
      VALID_TIERS.has(subscription.tier)
  );

  const isResolvedForCurrentUser = !userId || resolvedUserId === userId;

  return {
    subscription,
    hasActiveSubscription,
    loading: loading || !isResolvedForCurrentUser,
    refresh,
  };
}
