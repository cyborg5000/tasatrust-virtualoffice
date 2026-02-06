import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Phone, Users, Shield, Palette, Globe, CreditCard, ArrowRight } from "lucide-react";

const services = [
  {
    icon: MapPin,
    title: "Virtual Business Address",
    description:
      "Establish your business in a prestigious location. Use our address for business registration, mail, and to build credibility.",
    features: [
      "Use for LLC/Corp registration",
      "Professional business location",
      "Available in multiple cities",
    ],
  },
  {
    icon: Mail,
    title: "Mail Handling",
    description:
      "Never miss important mail. We receive, scan, and forward your business correspondence securely.",
    features: [
      "Mail receiving & scanning",
      "Package acceptance",
      "Forwarding service",
    ],
  },
  {
    icon: Phone,
    title: "Phone Answering",
    description:
      "Professional receptionists answer calls in your company name, take messages, and forward important calls.",
    features: [
      "Live call answering",
      "Custom greeting",
      "Call forwarding",
    ],
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    description:
      "Book fully-equipped meeting rooms on-demand. Impress clients with professional spaces when you need them.",
    features: [
      "Hourly booking",
      "Video conferencing",
      "Refreshments included",
    ],
  },
  {
    icon: Shield,
    title: "Registered Agent",
    description:
      "Meet your state's registered agent requirement with our reliable service. We handle legal documents professionally.",
    features: [
      "Compliance support",
      "Document handling",
      "Timely notifications",
    ],
  },
  {
    icon: Palette,
    title: "Logo Design",
    description:
      "Get a professional logo that represents your brand. Our designers create custom logos that make an impact.",
    features: [
      "Custom designs",
      "Multiple revisions",
      "All file formats",
    ],
  },
  {
    icon: Globe,
    title: "Website Development",
    description:
      "Launch your online presence with a professionally designed website that converts visitors into customers.",
    features: [
      "Custom design",
      "Mobile responsive",
      "SEO optimized",
    ],
  },
  {
    icon: CreditCard,
    title: "Business Cards",
    description:
      "Make lasting impressions with premium business cards. High-quality printing with fast turnaround.",
    features: [
      "Premium cardstock",
      "Custom designs",
      "Fast delivery",
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
            Everything you need to build and grow your business. From virtual
            office essentials to branding services.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
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
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
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

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
            Choose the plan that fits your needs and start building your
            professional business presence today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link to="/pricing">
              View Pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
