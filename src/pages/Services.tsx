import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowRight,
  CheckCircle
} from "lucide-react";

// Service categories
const serviceCategories = [
  {
    id: "virtual-office",
    title: "Virtual Office Services",
    description: "Professional business presence without the overhead",
    services: [
      {
        icon: MapPin,
        title: "Virtual Business Address",
        description:
          "Establish your business with a prestigious Singapore address. Use it for ACRA registration, business cards, and correspondence. Build instant credibility with clients and partners.",
        features: [
          "Use for company registration (ACRA)",
          "Professional business location",
          "Privacy protection for home address",
          "Available immediately",
        ],
      },
      {
        icon: Mail,
        title: "Mail Handling & Forwarding",
        description:
          "Never miss important business mail. We receive all your correspondence, scan documents, and forward packages to your preferred location worldwide.",
        features: [
          "Mail receiving & storage",
          "Document scanning & email notification",
          "Package acceptance",
          "Local & international forwarding",
        ],
      },
      {
        icon: Phone,
        title: "Phone Answering Service",
        description:
          "Professional receptionists answer calls in your company name. We take messages, forward urgent calls, and ensure your business never misses an opportunity.",
        features: [
          "Live call answering",
          "Custom company greeting",
          "Message taking & notifications",
          "Call forwarding to your number",
        ],
      },
      {
        icon: Users,
        title: "Meeting Rooms",
        description:
          "Book fully-equipped meeting rooms when you need to meet clients face-to-face. Impress with professional spaces in convenient locations.",
        features: [
          "Hourly & daily booking",
          "Video conferencing equipment",
          "Refreshments available",
          "Professional environment",
        ],
      },
    ],
  },
  {
    id: "corporate",
    title: "Company Incorporation & Secretarial",
    description: "Start and maintain your Singapore company with ease",
    services: [
      {
        icon: Building2,
        title: "Company Incorporation",
        description:
          "Register your Singapore company quickly and correctly. We handle all the paperwork with ACRA and ensure compliance from day one.",
        features: [
          "Same-day incorporation possible",
          "All company types supported",
          "ACRA compliance guaranteed",
          "Complete documentation package",
        ],
      },
      {
        icon: ClipboardCheck,
        title: "Corporate Secretary",
        description:
          "Every Singapore company must appoint a company secretary within 6 months. Our qualified secretaries handle all statutory filings and compliance requirements.",
        features: [
          "Nominee secretary service",
          "AGM & EGM management",
          "ACRA annual filings",
          "Statutory registers maintenance",
        ],
      },
      {
        icon: Briefcase,
        title: "Registered Office Address",
        description:
          "Your company's official address for receiving government correspondence and legal documents. A statutory requirement for all Singapore companies.",
        features: [
          "ACRA-compliant address",
          "Government correspondence handling",
          "Document forwarding",
          "Change of address assistance",
        ],
      },
    ],
  },
  {
    id: "accounting",
    title: "Accounting & Bookkeeping",
    description: "Keep your finances in order with cloud-based solutions",
    services: [
      {
        icon: Calculator,
        title: "Bookkeeping Services",
        description:
          "Cloud-based accounting system helps you keep proper records and monitor your financial health in real-time. Access your books anytime, anywhere.",
        features: [
          "Cloud accounting system included",
          "Monthly financial updates",
          "Bank reconciliation",
          "Real-time dashboard access",
        ],
      },
      {
        icon: FileText,
        title: "Financial Reporting",
        description:
          "Professional un-audited financial statements prepared by qualified accountants. Meet your statutory requirements with accurate reporting.",
        features: [
          "Un-audited financial statements",
          "XBRL filing preparation",
          "Management reports",
          "Year-end closing assistance",
        ],
      },
      {
        icon: CreditCard,
        title: "Payroll Management",
        description:
          "Comprehensive payroll processing for your team. We handle calculations, CPF contributions, and ensure timely salary disbursements.",
        features: [
          "Monthly payroll processing",
          "CPF submissions",
          "IR8A preparation",
          "Leave management support",
        ],
      },
    ],
  },
  {
    id: "tax",
    title: "Tax & Compliance",
    description: "Maximise savings while staying compliant",
    services: [
      {
        icon: Receipt,
        title: "Tax Services",
        description:
          "Our tax experts are familiar with Singapore regulations. We help maximise your tax savings while ensuring full compliance with IRAS requirements.",
        features: [
          "Corporate tax filing (Form C-S/C)",
          "Tax planning & advisory",
          "Estimated Chargeable Income filing",
          "Tax incentive applications",
        ],
      },
      {
        icon: Globe,
        title: "GST Submission",
        description:
          "For GST-registered businesses, we handle quarterly submissions accurately and on time. Stay compliant without the hassle.",
        features: [
          "Quarterly GST preparation",
          "GST registration assistance",
          "Input tax claim optimization",
          "IRAS correspondence handling",
        ],
      },
      {
        icon: FileText,
        title: "Audit & Assurance",
        description:
          "Our affiliated CPA firm provides auditing and assurance services to SMEs, MNCs, and listed company subsidiaries across industries.",
        features: [
          "Statutory audits",
          "Internal audit reviews",
          "Due diligence support",
          "Special purpose audits",
        ],
      },
    ],
  },
];

export default function Services() {
  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From virtual office solutions to comprehensive corporate services, 
            we provide everything your business needs to thrive in Singapore.
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b border-border bg-background py-4 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {serviceCategories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                asChild
              >
                <a href={`#${category.id}`}>{category.title}</a>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      {serviceCategories.map((category, categoryIndex) => (
        <section
          key={category.id}
          id={category.id}
          className={categoryIndex % 2 === 0 ? "py-16" : "bg-muted/30 py-16"}
        >
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                {category.title}
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                {category.description}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <Card
                  key={service.title}
                  className="flex flex-col border-border transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* All-in-1 Package Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-foreground">
              All-in-1 Service Packages
            </h2>
            <p className="mb-6 text-muted-foreground">
              Get comprehensive coverage with our bundled packages. 
              Corporate Secretary, Bookkeeping, Taxation, XBRL, and more — all included.
            </p>
            <ul className="mb-8 inline-flex flex-wrap justify-center gap-4 text-sm">
              <li className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                Corporate Secretary*
              </li>
              <li className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                Bookkeeping*
              </li>
              <li className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                Un-Audited Report*
              </li>
              <li className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                Taxation*
              </li>
              <li className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                XBRL*
              </li>
              <li className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                GST Submission
              </li>
            </ul>
            <p className="mb-8 text-xs text-muted-foreground">
              * Subject to terms. Packages specially designed for Trading, Service, Catering, 
              Retail, and Healthcare industries.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/#pricing">
                View Pricing Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Not Sure What You Need?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Our team is happy to discuss your requirements and recommend 
            the right services for your business. Get in touch today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link to="/contact">
                Schedule a Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+6584463191">Call +65 8446 3191</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
