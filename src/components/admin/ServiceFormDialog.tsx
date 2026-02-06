import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];
type ServiceVisibility = Database["public"]["Enums"]["service_visibility"];
type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];

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
  type: ServiceType;
  visibility: ServiceVisibility;
  is_active: boolean;
  display_order: number;
  pricing: TierPricing[];
}

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  initialData?: ServiceFormData | null;
  mode: "create" | "edit";
}

const TIERS: SubscriptionTier[] = ["basic", "essential", "professional"];
const CATEGORIES = ["Virtual Office", "Corporate", "Accounting", "Tax", "Legal", "Marketing"];

const defaultPricing: TierPricing[] = TIERS.map((tier) => ({
  tier,
  is_included: false,
  one_time_price: 0,
  recurring_price: 0,
  recurring_interval: "monthly",
}));

const defaultFormData: ServiceFormData = {
  name: "",
  description: "",
  category: "",
  icon: "Package",
  type: "one_time",
  visibility: "both",
  is_active: true,
  display_order: 0,
  pricing: defaultPricing,
};

export function ServiceFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ServiceFormDialogProps) {
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePricing = (tier: SubscriptionTier, field: keyof TierPricing, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((p) =>
        p.tier === tier ? { ...p, [field]: value } : p
      ),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Service" : "Edit Service"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new service with tier-based pricing"
              : "Update service details and pricing"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Virtual Mailbox"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service"
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Service Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ServiceType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-Time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: ServiceVisibility) =>
                  setFormData({ ...formData, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pricing_page">Pricing Page Only</SelectItem>
                  <SelectItem value="portal_only">Portal Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Service is Active</Label>
          </div>

          <Separator />

          {/* Tier Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Pricing by Tier</h3>
            {TIERS.map((tier) => {
              const pricing = formData.pricing.find((p) => p.tier === tier) || {
                tier,
                is_included: false,
                one_time_price: 0,
                recurring_price: 0,
                recurring_interval: "monthly",
              };

              return (
                <div
                  key={tier}
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{tier}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${tier}-included`}
                        checked={pricing.is_included}
                        onCheckedChange={(checked) =>
                          updatePricing(tier, "is_included", checked)
                        }
                      />
                      <Label htmlFor={`${tier}-included`} className="text-sm">
                        Included in plan
                      </Label>
                    </div>
                  </div>

                  {!pricing.is_included && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(formData.type === "one_time" || formData.type === "both") && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            One-Time Price ($)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={pricing.one_time_price}
                            onChange={(e) =>
                              updatePricing(tier, "one_time_price", parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      )}
                      {(formData.type === "recurring" || formData.type === "both") && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Recurring Price ($/month)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={pricing.recurring_price}
                            onChange={(e) =>
                              updatePricing(tier, "recurring_price", parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : mode === "create" ? (
              "Create Service"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
