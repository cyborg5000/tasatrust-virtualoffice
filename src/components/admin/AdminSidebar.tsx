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
  const { pathname } = location;
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
        const uniqueCategories = [
          ...new Set(data.flatMap((d) => (d.category ? [d.category] : []))),
        ];
        setCategories(uniqueCategories.sort());
      }
    }
    fetchCategories();
  }, []);

  // Auto-expand if on services page
  useEffect(() => {
    if (pathname === "/admin/services") {
      setServicesExpanded(true);
    }
  }, [pathname]);

  const currentCategory = searchParams.get("category");

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-border bg-secondary text-secondary-foreground lg:flex lg:flex-col">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-16 items-center gap-2 border-b border-secondary-foreground/10 px-6">
          <img src={logo} alt="TASA Trust" className="h-10 w-auto brightness-0 invert" />
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            if (item.hasSubmenu) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setServicesExpanded(!servicesExpanded)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-secondary-foreground/85 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4" />
                      {item.label}
                    </div>
                    {servicesExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                  {servicesExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-secondary-foreground/15 pl-3">
                      <Link
                        to="/admin/services"
                        className={cn(
                          "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                          pathname === "/admin/services" && !currentCategory
                            ? "bg-secondary-foreground/15 font-medium text-secondary-foreground"
                            : "text-secondary-foreground/75 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
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
                              ? "bg-secondary-foreground/15 font-medium text-secondary-foreground"
                              : "text-secondary-foreground/75 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
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
                    : "text-secondary-foreground/85 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-secondary-foreground/10 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-secondary-foreground/85 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
            asChild
          >
            <Link to="/member">
              <ChevronLeft className="mr-2 size-4" />
              Member Portal
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-secondary-foreground/85 hover:bg-secondary-foreground/10 hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 size-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
