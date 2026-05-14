import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  name: string;
  price: number;
  priceType: "one_time" | "recurring";
  recurringInterval?: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  userTier: string;
  memberId: string;
}

export function CartModal({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearCart,
  userTier,
  memberId,
}: CartModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleConfirmPurchase = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      // Process all cart items in parallel — each insert is independent.
      await Promise.all(
        items.map(async (item) => {
          // Create order entry
          const { error: orderError } = await supabase.from("orders").insert({
            member_id: memberId,
            service_id: item.id,
            amount: item.price,
            type: item.priceType,
            status: "completed",
            stripe_payment_intent_id: `sim_${Date.now()}_${item.id.slice(0, 8)}`,
          });

          if (orderError) throw orderError;

          // Create member_services entry
          const { error: memberServiceError } = await supabase
            .from("member_services")
            .insert({
              member_id: memberId,
              service_id: item.id,
              tier_at_purchase: userTier as "basic" | "essential" | "professional",
              one_time_purchased: item.priceType === "one_time",
              recurring_purchased: item.priceType === "recurring",
              is_active: true,
            });

          if (memberServiceError) throw memberServiceError;
        }),
      );

      setIsSuccess(true);
      
      toast({
        title: "Purchase Successful!",
        description: `${items.length} service${items.length > 1 ? "s" : ""} added to your account.`,
      });

      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        onClearCart();
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            {isSuccess ? "Order Confirmed" : "Your Cart"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Your services have been added to your account."
              : "Review your selected services before purchase."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="size-12 text-primary" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">Thank you!</p>
            <p className="text-sm text-muted-foreground">
              Your services are now active.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <ShoppingCart className="size-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                      {item.priceType === "recurring" && (
                        <span>/{item.recurringInterval || "month"}</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
