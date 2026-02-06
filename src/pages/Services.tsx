import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FilterSidebar } from "@/components/services/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, SlidersHorizontal, ArrowRight, CheckCircle } from "lucide-react";

interface ServiceWithPricing {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  oneTimePrice: number | null;
  recurringPrice: number | null;
  recurringInterval: string | null;
}

export default function Services() {
  const { toast } = useToast();
  
  const [services, setServices] = useState<ServiceWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch services with pricing (using basic tier as default for public)
  useEffect(() => {
    async function fetchServices() {
      setLoading(true);

      // Fetch services visible on pricing page
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .in("visibility", ["pricing_page", "both"])
        .order("display_order", { ascending: true });

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        setLoading(false);
        return;
      }

      // Fetch pricing for basic tier (public default)
      const { data: pricingData, error: pricingError } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("tier", "basic");

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
  }, []);

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

      // Price filter
      const price = Math.max(
        service.oneTimePrice || 0,
        service.recurringPrice || 0
      );
      if (price > 0 && (price < priceRange[0] || price > priceRange[1])) {
        return false;
      }

      return true;
    });
  }, [services, searchQuery, selectedCategories, priceRange]);

  // Group services by category for display
  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceWithPricing[]> = {};
    
    // Define category order
    const categoryOrder = [
      "Virtual Office",
      "Corporate",
      "Accounting",
      "Tax & Compliance",
    ];

    filteredServices.forEach((service) => {
      const category = service.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
    });

    // Sort categories by predefined order
    const sortedGroups: Record<string, ServiceWithPricing[]> = {};
    categoryOrder.forEach((cat) => {
      if (groups[cat]) {
        sortedGroups[cat] = groups[cat];
        delete groups[cat];
      }
    });
    
    // Add remaining categories
    Object.keys(groups).forEach((cat) => {
      sortedGroups[cat] = groups[cat];
    });

    return sortedGroups;
  }, [filteredServices]);

  const handleContactSales = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    toast({
      title: "Contact Sales",
      description: `Our team will reach out about ${service?.name || "this service"}.`,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From virtual office solutions to comprehensive corporate services, 
            we provide everything your business needs to thrive in Singapore.
          </p>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <section className="border-b border-border bg-background py-4 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
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
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
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
                  onClearFilters={handleClearFilters}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32 rounded-lg border border-border bg-card p-4">
                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={setSelectedCategories}
                  priceRange={priceRange}
                  maxPrice={maxPrice}
                  onPriceRangeChange={setPriceRange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </aside>

            {/* Services Content */}
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
              ) : Object.keys(groupedServices).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No services found matching your criteria.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-12">
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <div key={category}>
                      <h2 className="text-2xl font-bold text-foreground mb-6">
                        {category}
                      </h2>
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {categoryServices.map((service) => (
                          <ServiceCard
                            key={service.id}
                            {...service}
                            isIncluded={false}
                            isAuthenticated={false}
                            onContactSales={handleContactSales}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* All-in-1 Package CTA */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-foreground">
              All-in-1 Service Packages
            </h2>
            <p className="mb-6 text-muted-foreground">
              Get comprehensive coverage with our bundled packages. 
              Corporate Secretary, Bookkeeping, Taxation, XBRL, and more — all included.
            </p>
            <ul className="mb-8 inline-flex flex-wrap justify-center gap-4 text-sm">
              {[
                "Corporate Secretary*",
                "Bookkeeping*",
                "Un-Audited Report*",
                "Taxation*",
                "XBRL*",
                "GST Submission",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mb-8 text-xs text-muted-foreground">
              * Subject to terms. Packages specially designed for Trading, Service, Catering, 
              Retail, and Healthcare industries.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/#pricing">
                View Pricing Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Not Sure What You Need?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Our team is happy to discuss your requirements and recommend 
            the right services for your business. Get in touch today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link to="/contact">
                Schedule a Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+6584463191">Call +65 8446 3191</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
