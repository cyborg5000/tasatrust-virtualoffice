import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Users, 
  Building2, 
  FileText, 
  Calculator, 
  Receipt, 
  ClipboardCheck,
  Briefcase,
  Globe,
  CreditCard,
  Palette,
  Megaphone,
  MonitorSmartphone,
  Building,
  LucideIcon
} from "lucide-react";

// Icon mapping for services
const iconMap: Record<string, LucideIcon> = {
  MapPin,
  Mail,
  Phone,
  Users,
  Building2,
  FileText,
  Calculator,
  Receipt,
  ClipboardCheck,
  Briefcase,
  Globe,
  CreditCard,
  Palette,
  Megaphone,
  MonitorSmartphone,
  Building,
};

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  isIncluded: boolean;
  oneTimePrice: number | null;
  recurringPrice: number | null;
  recurringInterval: string | null;
  onAddToCart?: (serviceId: string) => void;
  onContactSales?: (serviceId: string) => void;
  isAuthenticated?: boolean;
}

export function ServiceCard({
  id,
  name,
  description,
  icon,
  category,
  isIncluded,
  oneTimePrice,
  recurringPrice,
  recurringInterval,
  onAddToCart,
  onContactSales,
  isAuthenticated = false,
}: ServiceCardProps) {
  const IconComponent = icon && iconMap[icon] ? iconMap[icon] : Building2;

  const formatPrice = (price: number | null) => {
    if (price === null || price === 0) return null;
    return `$${price.toFixed(2)}`;
  };

  const hasPrice = (oneTimePrice && oneTimePrice > 0) || (recurringPrice && recurringPrice > 0);

  return (
    <Card className="flex flex-col h-full border-border transition-all hover:shadow-lg hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-4">{name}</CardTitle>
        <CardDescription className="text-sm line-clamp-3">
          {description || "Professional service for your business needs."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <div className="space-y-2">
          {isIncluded ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              INCLUDED IN YOUR PLAN
            </Badge>
          ) : hasPrice ? (
            <div className="space-y-1">
              {oneTimePrice && oneTimePrice > 0 && (
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(oneTimePrice)}
                  <span className="text-sm font-normal text-muted-foreground"> one-time</span>
                </p>
              )}
              {recurringPrice && recurringPrice > 0 && (
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(recurringPrice)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{recurringInterval || "month"}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Contact for pricing</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {isIncluded ? (
          <Button variant="secondary" className="w-full" disabled>
            Already Included
          </Button>
        ) : hasPrice && isAuthenticated ? (
          <Button 
            className="w-full" 
            onClick={() => onAddToCart?.(id)}
          >
            Add to Cart
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onContactSales?.(id)}
          >
            Contact Sales
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
