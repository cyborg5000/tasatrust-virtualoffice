import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Menu,
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
} from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/website-builds", label: "Website Builds", icon: Globe },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminTopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-r border-border/40 bg-secondary p-0 text-secondary-foreground">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-2 border-b border-secondary-foreground/10 px-6">
                <img src={logo} alt="TASA Trust" className="h-10 w-auto brightness-0 invert" />
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Admin</span>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== "/admin" && location.pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-secondary-foreground/85 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
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
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/member">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Member Portal
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-secondary-foreground/85 hover:bg-secondary-foreground/10 hover:text-destructive"
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <img src={logo} alt="TASA Trust" className="h-8 w-auto" />
      </div>

      <div className="hidden lg:flex lg:items-center lg:gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">Admin Portal</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="max-w-[220px] truncate text-sm text-muted-foreground">{user?.email}</span>
      </div>
    </header>
  );
}
