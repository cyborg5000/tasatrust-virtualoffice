import { useState, useEffect, useMemo } from "react";
import { MemberLayout } from "@/components/member/MemberLayout";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FilterSidebar } from "@/components/services/FilterSidebar";
import { CartModal } from "@/components/services/CartModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { Search, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import { trackAddToCart } from "@/lib/analytics";

type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];

interface ServiceWithPricing {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  isIncluded: boolean;
  oneTimePrice: number | null;
  recurringPrice: number | null;
  recurringInterval: string | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  priceType: "one_time" | "recurring";
  recurringInterval?: string;
}

export default function MemberServices() {
  const { effectiveMemberId, isViewingAsMember } = useAdminMemberView();
  const { toast } = useToast();
  
  const [services, setServices] = useState<ServiceWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<SubscriptionTier>("basic");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showIncludedServices, setShowIncludedServices] = useState(true);

  // Fetch user's subscription tier
  useEffect(() => {
    async function fetchUserTier() {
      setUserTier("basic");

      if (!effectiveMemberId) return;

      const { data } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("member_id", effectiveMemberId)
        .eq("status", "active")
        .maybeSingle();

      if (data) {
        setUserTier(data.tier);
      }
    }

    fetchUserTier();
  }, [effectiveMemberId]);

  // Fetch services with pricing
  useEffect(() => {
    async function fetchServices() {
      setLoading(true);

      // Fetch services that are visible in portal
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .in("visibility", ["portal_only", "both"])
        .order("display_order", { ascending: true });

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        setLoading(false);
        return;
      }

      // Fetch pricing for user's tier
      const { data: pricingData, error: pricingError } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("tier", userTier);

      if (pricingError) {
        console.error("Error fetching pricing:", pricingError);
      }

      // Map services with pricing
      const servicesWithPricing: ServiceWithPricing[] = (servicesData || []).map(
        (service) => {
          const pricing = pricingData?.find((p) => p.service_id === service.id);
          return {
            id: service.id,
            name: service.name,
            description: service.description,
            icon: service.icon,
            category: service.category,
            isIncluded: pricing?.is_included || false,
            oneTimePrice: pricing?.one_time_price || null,
            recurringPrice: pricing?.recurring_price || null,
            recurringInterval: pricing?.recurring_interval || null,
          };
        }
      );

      setServices(servicesWithPricing);
      setLoading(false);
    }

    fetchServices();
  }, [userTier]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = services
      .map((s) => s.category)
      .filter((c): c is string => c !== null);
    return [...new Set(cats)];
  }, [services]);

  // Get max price for slider
  const maxPrice = useMemo(() => {
    const prices = services.flatMap((s) => [
      s.oneTimePrice || 0,
      s.recurringPrice || 0,
    ]);
    return Math.max(...prices, 1000);
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      if (
        searchQuery &&
        !service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategories.length > 0 &&
        (!service.category || !selectedCategories.includes(service.category))
      ) {
        return false;
      }

      // Price filter (only for non-included services)
      if (!service.isIncluded) {
        const price = Math.max(
          service.oneTimePrice || 0,
          service.recurringPrice || 0
        );
        if (price < priceRange[0] || price > priceRange[1]) {
          return false;
        }
      }

      if (!showIncludedServices && service.isIncluded) {
        return false;
      }

      return true;
    });
  }, [services, searchQuery, selectedCategories, priceRange, showIncludedServices]);

  const handleAddToCart = (serviceId: string) => {
    if (isViewingAsMember) {
      toast({
        title: "View-only mode",
        description: "Return to admin view to manage this member without simulating a purchase.",
      });
      return;
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    // Check if already in cart
    if (cartItems.some((item) => item.id === serviceId)) {
      toast({
        title: "Already in cart",
        description: `${service.name} is already in your cart.`,
      });
      return;
    }

    // Determine price type and amount
    const price = service.oneTimePrice || service.recurringPrice || 0;
    const priceType = service.oneTimePrice ? "one_time" : "recurring";

    setCartItems([
      ...cartItems,
      {
        id: service.id,
        name: service.name,
        price,
        priceType,
        recurringInterval: service.recurringInterval || undefined,
      },
    ]);

    trackAddToCart({ id: service.id, name: service.name, price, priceType });

    toast({
      title: "Added to cart",
      description: `${service.name} has been added to your cart.`,
    });
  };

  const handleContactSales = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    toast({
      title: "Contact Sales",
      description: `Our team will reach out about ${service?.name || "this service"}.`,
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
    setShowIncludedServices(true);
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Services</h1>
            <p className="text-muted-foreground">
              Browse and purchase additional services for your business
            </p>
          </div>
          
          {/* Cart Button */}
          <Button
            variant="outline"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cartItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItems.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search and Mobile Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceRangeChange={setPriceRange}
                showIncludedServices={showIncludedServices}
                onShowIncludedServicesChange={setShowIncludedServices}
                onClearFilters={handleClearFilters}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 rounded-lg border border-border bg-card p-4">
              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceRangeChange={setPriceRange}
                showIncludedServices={showIncludedServices}
                onShowIncludedServicesChange={setShowIncludedServices}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Services Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border p-6">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-6 w-20 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No services found matching your criteria.
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    {...service}
                    isAuthenticated={true}
                    onAddToCart={handleAddToCart}
                    onContactSales={handleContactSales}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        userTier={userTier}
        memberId={effectiveMemberId || ""}
      />
    </MemberLayout>
  );
}
