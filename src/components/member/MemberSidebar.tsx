import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import logo from "@/assets/logo.png";

const sidebarLinks = [
  { href: "/member", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/member/services", label: "Services", icon: Briefcase },
  { href: "/member/bookings", label: "Bookings", icon: Calendar },
  { href: "/member/billing", label: "Billing", icon: CreditCard },
  { href: "/member/settings", label: "Settings", icon: Settings },
];

export function MemberSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAdminAuth();
  const { isViewingAsMember, returnToAdminView } = useAdminMemberView();

  const isActive = (href: string, end?: boolean) => {
    if (end) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-shrink-0 flex-col border-r border-border bg-secondary transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <img src={logo} alt="TASA Trust" className="h-10 w-auto brightness-0 invert" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-secondary-foreground hover:bg-secondary-foreground/10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            end={link.end}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(link.href, link.end)
                ? "bg-primary text-primary-foreground"
                : "text-secondary-foreground hover:bg-secondary-foreground/10"
            )}
          >
            <link.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {isAdmin && isViewingAsMember && (
          <Button
            variant="ghost"
            className={cn(
              "mb-2 w-full text-secondary-foreground hover:bg-secondary-foreground/10",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
            onClick={returnToAdminView}
          >
            <Shield className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Return Admin"}
          </Button>
        )}
        {isAdmin && !isViewingAsMember && (
          <Button
            variant="ghost"
            asChild
            className={cn(
              "mb-2 w-full text-secondary-foreground hover:bg-secondary-foreground/10",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
          >
            <Link to="/admin">
              <Shield className={cn("h-4 w-4", !collapsed && "mr-2")} />
              {!collapsed && "Admin Portal"}
            </Link>
          </Button>
        )}
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TASA Trust
          </p>
        )}
      </div>
    </aside>
  );
}
