import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield, Award, ArrowRight, Target, Heart, Lightbulb } from "lucide-react";
import teamMeeting from "@/assets/team-meeting.jpg";
import corporateBuilding from "@/assets/corporate-building.jpg";

const stats = [
  { value: "500+", label: "Businesses Served" },
  { value: "10+", label: "Years Experience" },
  { value: "99%", label: "Client Satisfaction" },
  { value: "24hr", label: "Response Time" },
];

const values = [
  {
    icon: Target,
    title: "Accountability",
    description:
      "We take responsibility for our work and deliver on our promises. Your success is our accountability.",
  },
  {
    icon: Lightbulb,
    title: "Skilled Excellence",
    description:
      "Our team brings deep expertise in accounting, corporate law, and business services to every engagement.",
  },
  {
    icon: Heart,
    title: "Agility",
    description:
      "We adapt quickly to your needs and Singapore's ever-evolving business landscape.",
  },
  {
    icon: Shield,
    title: "Trust & Integrity",
    description:
      "We build lasting relationships through transparency, honesty, and ethical business practices.",
  },
];

const whyChooseUs = [
  {
    title: "Local Expertise",
    description: "Deep understanding of Singapore's regulatory requirements and business environment.",
  },
  {
    title: "All-in-One Solution",
    description: "From virtual office to accounting — we handle everything so you can focus on growth.",
  },
  {
    title: "Technology-Driven",
    description: "Cloud-based systems give you real-time visibility into your business finances.",
  },
  {
    title: "Personal Service",
    description: "Dedicated account managers who know your business and are always available.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Header Section */}
      <section className="relative overflow-hidden bg-secondary py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${corporateBuilding})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/95 to-secondary" />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            About <span className="text-primary">TASA Trust</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A Team of Accountability, Skilled and Agility — delivering professional 
            service of the highest quality since 2014.
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
                  TASA Trust was founded with a simple belief: every business deserves 
                  access to professional corporate services, regardless of size. Too many 
                  entrepreneurs were struggling with the administrative burden of running 
                  a business in Singapore.
                </p>
                <p>
                  With Singapore's push toward becoming a Smart Nation, we saw an opportunity 
                  to modernize how businesses handle their corporate needs. We embraced 
                  cloud technology early, giving our clients real-time visibility into 
                  their financial health — a far cry from traditional accounting.
                </p>
                <p>
                  Today, we serve hundreds of businesses across Trading, Service, Catering, 
                  Retail, and Healthcare industries. From startups to established SMEs, 
                  our clients trust us to handle their corporate secretary, accounting, 
                  taxation, and virtual office needs with professionalism and care.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-xl" />
              <img 
                src={teamMeeting} 
                alt="TASA Trust team meeting" 
                className="relative rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-6 shadow-xl">
                <p className="text-3xl font-bold text-primary mb-1">TASA</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">T</span>eam of{" "}
                  <span className="font-semibold">A</span>ccountability,{" "}
                  <span className="font-semibold">S</span>killed and{" "}
                  <span className="font-semibold">A</span>gility
                </p>
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
              Our Core Values
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The principles that guide everything we do at TASA Trust.
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

      {/* Why Choose Us Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Why Businesses Choose Us
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {whyChooseUs.map((item) => (
              <Card key={item.title} className="border-border">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Visit Our Office
            </h2>
            <p className="mb-6 text-muted-foreground">
              We're located in the heart of Singapore's East district.
            </p>
            <div className="rounded-lg bg-muted p-6 text-left">
              <p className="font-semibold text-foreground">TASA Trust Pte. Ltd.</p>
              <p className="text-muted-foreground">
                Blk 2 Joo Chiat Road #05-1131<br />
                Singapore 420002
              </p>
              <p className="mt-4 text-muted-foreground">
                <span className="font-medium">Office Hours:</span><br />
                Monday – Friday: 9:00 AM – 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary-foreground">
            Ready to Work With Us?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Let's discuss how TASA Trust can support your business. 
            Contact us for a free consultation.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
              <Link to="/services">View Our Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
