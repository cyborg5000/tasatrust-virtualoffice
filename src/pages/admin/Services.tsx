import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ServiceFormDialog } from "@/components/admin/ServiceFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];
type ServicePricing = Database["public"]["Tables"]["service_pricing"]["Row"];
type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];

interface ServiceWithPricing extends Service {
  service_pricing: ServicePricing[];
}

interface TierPricing {
  tier: SubscriptionTier;
  is_included: boolean;
  one_time_price: number;
  recurring_price: number;
  recurring_interval: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  icon: string;
  type: Database["public"]["Enums"]["service_type"];
  visibility: Database["public"]["Enums"]["service_visibility"];
  is_active: boolean;
  display_order: number;
  pricing: TierPricing[];
}

const TIERS: SubscriptionTier[] = ["basic", "essential", "professional"];

export default function AdminServices() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const [services, setServices] = useState<ServiceWithPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    let query = supabase
      .from("services")
      .select(`*, service_pricing(*)`)
      .order("display_order", { ascending: true });

    if (categoryFilter) {
      query = query.eq("category", categoryFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching services:", error);
      toast({ title: "Error", description: "Failed to load services", variant: "destructive" });
    } else {
      setServices(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [categoryFilter]);

  const handleCreate = () => {
    setDialogMode("create");
    setEditingService(null);
    setEditingServiceId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: ServiceWithPricing) => {
    const pricing: TierPricing[] = TIERS.map((tier) => {
      const existing = service.service_pricing.find((p) => p.tier === tier);
      return {
        tier,
        is_included: existing?.is_included ?? false,
        one_time_price: existing?.one_time_price ?? 0,
        recurring_price: existing?.recurring_price ?? 0,
        recurring_interval: existing?.recurring_interval ?? "monthly",
      };
    });

    setDialogMode("edit");
    setEditingServiceId(service.id);
    setEditingService({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      icon: service.icon || "Package",
      type: service.type,
      visibility: service.visibility,
      is_active: service.is_active ?? true,
      display_order: service.display_order ?? 0,
      pricing,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      if (dialogMode === "create") {
        // Insert service
        const { data: newService, error: serviceError } = await supabase
          .from("services")
          .insert({
            name: data.name,
            description: data.description || null,
            category: data.category || null,
            icon: data.icon || null,
            type: data.type,
            visibility: data.visibility,
            is_active: data.is_active,
            display_order: data.display_order,
          })
          .select()
          .single();

        if (serviceError) throw serviceError;

        // Insert pricing for each tier
        const pricingInserts = data.pricing.map((p) => ({
          service_id: newService.id,
          tier: p.tier,
          is_included: p.is_included,
          one_time_price: p.one_time_price,
          recurring_price: p.recurring_price,
          recurring_interval: p.recurring_interval,
        }));

        const { error: pricingError } = await supabase
          .from("service_pricing")
          .insert(pricingInserts);

        if (pricingError) throw pricingError;

        toast({ title: "Success", description: "Service created successfully" });
      } else if (editingServiceId) {
        // Update service
        const { error: serviceError } = await supabase
          .from("services")
          .update({
            name: data.name,
            description: data.description || null,
            category: data.category || null,
            icon: data.icon || null,
            type: data.type,
            visibility: data.visibility,
            is_active: data.is_active,
            display_order: data.display_order,
          })
          .eq("id", editingServiceId);

        if (serviceError) throw serviceError;

        // Upsert pricing for each tier
        for (const p of data.pricing) {
          const { error: pricingError } = await supabase
            .from("service_pricing")
            .upsert(
              {
                service_id: editingServiceId,
                tier: p.tier,
                is_included: p.is_included,
                one_time_price: p.one_time_price,
                recurring_price: p.recurring_price,
                recurring_interval: p.recurring_interval,
              },
              { onConflict: "service_id,tier" }
            );

          if (pricingError) {
            // If upsert fails, try insert
            await supabase.from("service_pricing").insert({
              service_id: editingServiceId,
              tier: p.tier,
              is_included: p.is_included,
              one_time_price: p.one_time_price,
              recurring_price: p.recurring_price,
              recurring_interval: p.recurring_interval,
            });
          }
        }

        toast({ title: "Success", description: "Service updated successfully" });
      }

      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast({ title: "Error", description: "Failed to save service", variant: "destructive" });
    }
  };

  const handleToggleActive = async (service: ServiceWithPricing) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      );
    }
  };

  const handleDelete = async (service: ServiceWithPricing) => {
    if (!confirm(`Delete "${service.name}"? This action cannot be undone.`)) return;

    // Delete pricing first
    await supabase.from("service_pricing").delete().eq("service_id", service.id);

    const { error } = await supabase.from("services").delete().eq("id", service.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Service removed successfully" });
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Services` : "Service Management"}
            </h1>
            <p className="text-muted-foreground">
              {categoryFilter ? `Showing services in "${categoryFilter}" category` : "Manage services and tier-based pricing"}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Services ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No services yet. Click "Add Service" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.category ? (
                          <Badge variant="outline">{service.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {service.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground capitalize">
                          {service.visibility.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.is_active ?? true}
                          onCheckedChange={() => handleToggleActive(service)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(service)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ServiceFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingService}
        mode={dialogMode}
      />
    </AdminLayout>
  );
}
