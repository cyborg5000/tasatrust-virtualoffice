import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PricingSection } from "@/components/pricing/PricingSection";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  return (
    <Layout>
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/80 md:text-lg">
            Every plan is clear, practical, and built for operational confidence. Optional add-ons shown below are
            managed dynamically from admin settings.
          </p>
        </div>
      </section>

      <PricingSection />

      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Can I change plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. You can upgrade or adjust your services as your business needs evolve.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">How are optional add-ons billed?</h3>
              <p className="text-sm text-muted-foreground">
                One-time add-ons are charged once at checkout. Recurring add-ons are added to your monthly billing.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                Stripe supports all major cards and local payment options based on your region.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary">Ready to Activate Your Account?</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Create your account, choose your plan, add any optional services, and complete secure checkout in minutes.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
