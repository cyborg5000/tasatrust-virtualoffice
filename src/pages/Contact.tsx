import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import corporateBuilding from "@/assets/corporate-building.jpg";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .optional(),
  company: z
    .string()
    .trim()
    .optional(),
  inquiryType: z.enum(["virtual-office", "incorporation", "accounting", "general"], {
    required_error: "Please select an inquiry type",
  }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    value: "+65 8446 3191",
    description: "WhatsApp available",
    link: "tel:+6584463191",
  },
  {
    icon: Mail,
    title: "Email",
    value: "info@tasatrust.com",
    description: "We'll respond within 24 hours",
    link: "mailto:info@tasatrust.com",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Blk 2 Joo Chiat Road #05-1131",
    description: "Singapore 420002",
  },
  {
    icon: Clock,
    title: "Office Hours",
    value: "Monday – Friday",
    description: "9:00 AM – 6:00 PM SGT",
  },
];

const faqs = [
  {
    question: "How quickly can I get a virtual address?",
    answer: "Same day setup is possible. Once you sign up and complete verification, you can start using your Singapore business address immediately.",
  },
  {
    question: "Can I use the address for company registration?",
    answer: "Yes! Our addresses are fully compliant for ACRA company registration and can be used as your official registered office address.",
  },
  {
    question: "What's included in the All-in-1 packages?",
    answer: "Our packages include corporate secretary, bookkeeping, un-audited reports, taxation, and XBRL filing. Specific inclusions vary by tier.",
  },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      inquiryType: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("submit-contact-message", {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });

      form.reset();
    } catch (error: unknown) {
      console.error("Contact submit failed:", error);
      toast({
        title: "Failed to send message",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while sending your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <section className="relative overflow-hidden bg-secondary py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${corporateBuilding})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/95 to-secondary" />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Have questions about our services? Ready to get started? 
            We're here to help your business succeed in Singapore.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+65 XXXX XXXX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@company.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your company name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What can we help you with? *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="virtual-office">Virtual Office / Business Address</SelectItem>
                              <SelectItem value="incorporation">Company Incorporation</SelectItem>
                              <SelectItem value="accounting">Accounting & Tax Services</SelectItem>
                              <SelectItem value="general">General Inquiry</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your business and how we can help..."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  Contact Information
                </h2>
                <p className="text-muted-foreground">
                  Reach out directly or visit us at our office in Singapore.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {contactInfo.map((info) => (
                  <Card key={info.title} className="border-border">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {info.title}
                        </h3>
                        {info.link ? (
                          <a 
                            href={info.link} 
                            className="text-foreground hover:text-primary transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-foreground">{info.value}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <MessageCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      Prefer WhatsApp?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Message us directly for a quick response
                    </p>
                  </div>
                  <Button asChild>
                    <a 
                      href="https://wa.me/6584463191" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Chat Now
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* FAQs */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.question} className="rounded-lg border border-border p-4">
                      <h4 className="font-medium text-foreground">{faq.question}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
