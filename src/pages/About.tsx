import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Globe, Award, ArrowRight } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Businesses Served" },
  { value: "50+", label: "Locations" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const values = [
  {
    icon: Building2,
    title: "Professional Excellence",
    description:
      "We maintain the highest standards in everything we do, ensuring your business always looks its best.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Your success is our priority. We go above and beyond to support your business growth.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "With locations across major cities, we help businesses establish presence worldwide.",
  },
  {
    icon: Award,
    title: "Trusted Reliability",
    description:
      "Count on us for consistent, dependable service that keeps your business running smoothly.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    bio: "20+ years in business services",
  },
  {
    name: "Michael Chen",
    role: "COO",
    bio: "Expert in operations management",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Customer Success",
    bio: "Passionate about client satisfaction",
  },
  {
    name: "David Kim",
    role: "CTO",
    bio: "Leading our digital innovation",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            About <span className="text-primary">TasaTrust Virtual</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We're on a mission to make professional business presence accessible
            to everyone. Learn more about who we are and what drives us.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2015, TasaTrust Virtual started with a simple idea:
                  businesses shouldn't need expensive office leases to project
                  professionalism.
                </p>
                <p>
                  What began as a single location has grown into a network of
                  50+ premium addresses across major business centers. We've
                  helped over 10,000 businesses establish their professional
                  presence.
                </p>
                <p>
                  Today, we continue to innovate, offering comprehensive virtual
                  office solutions that combine prestigious addresses, modern
                  technology, and exceptional service.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-card shadow-2xl">
                  <Building2 className="h-24 w-24 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-2 text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Our Values
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              These core values guide everything we do at TasaTrust Virtual.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="border-border text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Leadership Team
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Meet the people driving TasaTrust Virtual forward.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card key={member.name} className="border-border text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  <h3 className="font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Ready to Join Us?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Become part of the TasaTrust Virtual community and elevate your
            business presence today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link to="/pricing">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
