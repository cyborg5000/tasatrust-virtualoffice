import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "How quickly can I get a virtual business address?",
    answer: "Most clients can start using a virtual office address soon after onboarding and verification are completed.",
  },
  {
    question: "Can I use a virtual address for company registration?",
    answer: "Yes. Our addresses are suitable for ACRA registration and are fully documented for compliance workflows.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes. You can upgrade your plan or adjust add-ons through the member portal.",
  },
  {
    question: "What happens to included services when I change tiers?",
    answer: "Included and optional services are applied based on your active plan. Included items are shown separately in your services list.",
  },
  {
    question: "How are optional services billed?",
    answer: "Some add-ons are one-time charges and some are recurring. The checkout summary shows total one-time and recurring totals before payment.",
  },
];

export default function Faq() {
  return (
    <Layout>
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto max-w-2xl text-white/80">
            Quick answers for setup, onboarding, services, billing, and support.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto space-y-4 px-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">{faq.answer}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}

