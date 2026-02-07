import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { createEmptyTierPricing, type PricingAddon } from "@/lib/pricingCatalog";

type ServiceVisibility = Database["public"]["Enums"]["service_visibility"];

interface UsePricingCatalogResult {
  addons: PricingAddon[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_VISIBILITY: ServiceVisibility[] = ["pricing_page", "both"];

export function usePricingCatalog(
  visibility: ServiceVisibility[] = DEFAULT_VISIBILITY
): UsePricingCatalogResult {
  const [addons, setAddons] = useState<PricingAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, name, description, type, visibility, display_order")
        .eq("is_active", true)
        .in("visibility", visibility)
        .order("display_order", { ascending: true });

      if (servicesError) throw servicesError;

      const serviceIds = (servicesData || []).map((service) => service.id);

      if (serviceIds.length === 0) {
        setAddons([]);
        return;
      }

      const { data: pricingData, error: pricingError } = await supabase
        .from("service_pricing")
        .select("service_id, tier, is_included, one_time_price, recurring_price, recurring_interval")
        .in("service_id", serviceIds);

      if (pricingError) throw pricingError;

      const mappedAddons: PricingAddon[] = (servicesData || []).map((service) => {
        const pricingByTier = createEmptyTierPricing();

        for (const row of pricingData || []) {
          if (row.service_id !== service.id) continue;

          pricingByTier[row.tier] = {
            isIncluded: row.is_included ?? false,
            oneTimePrice: Number(row.one_time_price ?? 0),
            recurringPrice: Number(row.recurring_price ?? 0),
            recurringInterval: row.recurring_interval || "month",
          };
        }

        return {
          id: service.id,
          name: service.name,
          description: service.description,
          type: service.type,
          visibility: service.visibility,
          displayOrder: service.display_order ?? 0,
          pricing: pricingByTier,
        };
      });

      setAddons(mappedAddons);
    } catch (fetchError: unknown) {
      console.error("Error fetching pricing catalog:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load pricing catalog");
      setAddons([]);
    } finally {
      setLoading(false);
    }
  }, [visibility]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { addons, loading, error, refresh };
}
