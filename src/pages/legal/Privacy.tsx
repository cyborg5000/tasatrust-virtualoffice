import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            How we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="mb-4 text-2xl font-bold">1. Introduction</h2>
              <p className="text-muted-foreground">
                TASA Trust Pte. Ltd. ("we", "our" or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">2. Information We Collect</h2>
              <p className="mb-4 text-muted-foreground">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Register for an account</li>
                <li>Subscribe to our services</li>
                <li>Contact us for support</li>
                <li>Request a quote or consultation</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                This information may include your name, email address, phone number, company details, and payment information.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">3. How We Use Your Information</h2>
              <p className="mb-4 text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you promotional communications (with your consent)</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal requirements or respond to lawful requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">6. Your Rights</h2>
              <p className="mb-4 text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">
                We may use cookies, web beacons, and similar tracking technologies to collect information about your browsing activities. You can set your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">8. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review their privacy policies.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Modified" date.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> info@tasatrust.com</p>
                <p><strong>Phone:</strong> +65 8446 3191</p>
                <p><strong>Address:</strong> 101 Cecil Street #15-06, Singapore 069533</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Last Modified: February 6, 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Have Questions?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            We're here to help you understand our policies better.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </Layout>
  );
}
