import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Help() {
  return (
    <Layout>
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Need Help?</h1>
          <p className="mx-auto max-w-2xl text-white/80">
            Everything to get started, with quick links to contact, services, pricing, and account help.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid gap-4 px-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                Choose your plan, add-ons, and complete onboarding from the member portal.
              </CardDescription>
              <Button asChild className="w-full">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Catalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                Browse service categories and add add-ons from your dashboard.
              </CardDescription>
              <Button asChild className="w-full" variant="outline">
                <Link to="/services">Browse Services</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                Contact our team directly for implementation, billing, and contract support.
              </CardDescription>
              <Button asChild className="w-full" variant="outline">
                <Link to="/contact">Send a Message</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

