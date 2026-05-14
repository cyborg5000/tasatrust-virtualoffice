import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
  support: [
    { href: "/blog", label: "Blog Archive" },
    { href: "/faq", label: "FAQ" },
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Support" },
  ],
};

const socialLinks = [
  { href: "https://www.facebook.com/Contact.TASATrust/", icon: Facebook, label: "Facebook" },
  { href: "https://www.linkedin.com/company/tasa-trust-pte-ltd/", icon: Linkedin, label: "LinkedIn" },
  { href: "https://www.instagram.com/tasatrust", icon: Instagram, label: "Instagram" },
  { href: "https://wa.me/6584463191", icon: Phone, label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-secondary text-secondary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_35%)]" aria-hidden="true" />
      <div className="container relative mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <img src={logo} alt="TASA Trust" className="h-12 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/75">
              A Team of Accountability, Skilled and Agility ("TASA"). Professional support that helps businesses
              launch and scale confidently in Singapore.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="mt-0.5 size-4 flex-shrink-0 text-primary" />
                <span>101 Cecil Street #15-06, Singapore 069533</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Phone className="size-4 text-primary" />
                <a href="https://wa.me/6584463191" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  +65 8446 3191
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Mail className="size-4 text-primary" />
                <a href="mailto:info@tasatrust.com" className="hover:text-primary">
                  info@tasatrust.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/80 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/80 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/80 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
            <p className="text-sm text-white/65" suppressHydrationWarning>© {new Date().getFullYear()} TASA Trust Pte. Ltd. All rights reserved.</p>
            <span className="hidden text-white/40 md:inline">|</span>
            <p className="text-sm text-white/65">
              Powered by{' '}
              <a
                href="https://essentialblock.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Essential Block
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-primary/70 hover:text-primary"
                aria-label={social.label}
              >
                <social.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
