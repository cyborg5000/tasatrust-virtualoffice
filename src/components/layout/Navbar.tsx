import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

const servicesLinks = [
  { href: "/services?cat=virtual-office", label: "Virtual Office" },
  { href: "/services?cat=accounting", label: "Accounting" },
  { href: "/services?cat=tax", label: "Tax" },
  { href: "/services?cat=corp-sec", label: "Corp Sec" },
];

const footerNavLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const servicesBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setServicesOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setServicesOpen(false);
        servicesBtnRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const closeServicesMenu = () => {
    setServicesOpen(false);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border/70 bg-white/90 shadow-[0_10px_28px_-22px_hsl(var(--secondary)/0.9)] backdrop-blur-lg"
          : "border-transparent bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm"
      )}
      aria-label="Primary"
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "items-center transition-all duration-300",
            scrolled ? "h-16" : "h-20",
            "grid grid-cols-[1fr_auto_1fr] md:flex md:justify-between"
          )}
        >
          <Link to="/" className="flex items-center justify-center gap-3 col-start-2 col-end-3 md:col-auto md:justify-start">
            <img
              src={logo}
              alt="TASA Trust"
              className={cn("w-auto transition-all duration-300", scrolled ? "h-10" : "h-12")}
              loading="eager"
            />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-secondary/80 lg:inline">
              Virtual Office
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={location.pathname === link.href ? "page" : undefined}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  location.pathname === link.href ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div
              ref={servicesMenuRef}
              className="relative -mb-2 pb-2"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
              onFocus={() => setServicesOpen(true)}
              onBlur={(event) => {
                const related = event.relatedTarget as Node | null;
                if (servicesMenuRef.current?.contains(related)) {
                  return;
                }
                closeServicesMenu();
              }}
            >
              <button
                ref={servicesBtnRef}
                type="button"
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold transition-colors",
                  location.pathname.includes("/services") ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                )}
                onClick={() => setServicesOpen((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeServicesMenu();
                  }
                }}
                aria-expanded={servicesOpen}
                aria-haspopup="menu"
                aria-controls="services-dropdown"
              >
                Services
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", servicesOpen && "rotate-180")}
                />
              </button>

              {servicesOpen && (
                <div id="services-dropdown" role="menu" className="surface-panel absolute left-0 top-full mt-1 w-56 p-2">
                  {servicesLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      role="menuitem"
                      onClick={closeServicesMenu}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          closeServicesMenu();
                          servicesBtnRef.current?.focus();
                        }
                      }}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {footerNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={location.pathname === link.href ? "page" : undefined}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  location.pathname === link.href ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/signup">
                Start Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="col-start-3 col-end-4 flex justify-end md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-white/80">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </div>
          </button>
        </div>

        {isOpen && (
          <div className="animate-fade-up border-t border-border/70 py-5 md:hidden">
            <div id="mobile-nav" ref={mobileMenuRef} className="surface-panel p-4">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    aria-current={location.pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-semibold",
                      location.pathname === link.href
                        ? "bg-secondary text-secondary-foreground"
                        : "text-secondary hover:bg-muted"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Services
                </p>
                {servicesLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-2 text-sm text-secondary/85 hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                {footerNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    aria-current={location.pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-semibold",
                      location.pathname === link.href
                        ? "bg-secondary text-secondary-foreground"
                        : "text-secondary hover:bg-muted"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={closeMobileMenu}>
                    Log In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup" onClick={closeMobileMenu}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
