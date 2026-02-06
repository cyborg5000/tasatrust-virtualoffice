import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/services", label: "Services", icon: Package, hasSubmenu: true },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/website-builds", label: "Website Builds", icon: Globe },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signOut } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from("services")
        .select("category")
        .not("category", "is", null);

      if (data) {
        const uniqueCategories = [...new Set(data.map((d) => d.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories.sort());
      }
    }
    fetchCategories();
  }, []);

  // Auto-expand if on services page
  useEffect(() => {
    if (location.pathname === "/admin/services") {
      setServicesExpanded(true);
    }
  }, [location.pathname]);

  const currentCategory = searchParams.get("category");

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col h-screen sticky top-0">
      <div className="flex h-full flex-col overflow-hidden">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <img src={logo} alt="TASA Trust" className="h-10 w-auto" />
          <span className="text-xs font-medium text-primary">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/admin" && location.pathname.startsWith(item.href));

            if (item.hasSubmenu) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setServicesExpanded(!servicesExpanded)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {servicesExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {servicesExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                      <Link
                        to="/admin/services"
                        className={cn(
                          "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                          location.pathname === "/admin/services" && !currentCategory
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        All Services
                      </Link>
                      {categories.map((category) => (
                        <Link
                          key={category}
                          to={`/admin/services?category=${encodeURIComponent(category)}`}
                          className={cn(
                            "block rounded-lg px-3 py-1.5 text-sm capitalize transition-colors",
                            currentCategory === category
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            asChild
          >
            <Link to="/member">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Member Portal
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
