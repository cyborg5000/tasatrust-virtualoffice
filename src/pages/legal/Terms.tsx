import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            The rules and guidelines for using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="mb-4 text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using the services provided by TASA Trust Pte. Ltd. ("we", "our" or "us"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">2. Description of Services</h2>
              <p className="text-muted-foreground">
                TASA Trust provides corporate services including but not limited to corporate secretary services, accounting, taxation, payroll management, and virtual office solutions. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">3. User Registration</h2>
              <p className="mb-4 text-muted-foreground">
                To use certain features of our services, you may be required to register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">4. Service Fees and Payment</h2>
              <p className="mb-4 text-muted-foreground">
                Our services may be subject to fees. By subscribing to a paid service, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Pay all applicable fees and charges</li>
                <li>Provide valid payment information</li>
                <li>Allow us to process recurring payments for subscriptions</li>
                <li>Understand that fees are non-refundable except as required by law</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">5. Cancellation and Termination</h2>
              <p className="mb-4 text-muted-foreground">
                <strong>Monthly Subscriptions:</strong> You may cancel your monthly subscription at any time. Cancellation will take effect at the end of the current billing period.
              </p>
              <p className="text-muted-foreground">
                <strong>Annual Subscriptions:</strong> Annual subscriptions may be cancelled, but refunds will not be provided for the unused portion of the term unless required by law.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">6. Acceptable Use</h2>
              <p className="mb-4 text-muted-foreground">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use our services for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt our services or servers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Use our services in a way that violates any laws or regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of our services (including but not limited to text, graphics, logos, icons, images, audio clips, and software) are owned by TASA Trust Pte. Ltd. and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reproduce any part of our services without our express written permission.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                IN NO EVENT SHALL TASA TRUST PTE. LTD. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OUR SERVICES.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">10. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless TASA Trust Pte. Ltd. and its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, or expenses arising out of your use of our services or your violation of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of Singapore, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Singapore.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">12. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Modified" date. Your continued use of our services after any changes constitutes acceptance of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">13. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> info@tasatrust.com</p>
                <p><strong>Phone:</strong> +65 8446 3191</p>
                <p><strong>Address:</strong> 101 Cecil Street #15-06 Tong Eng Building, Singapore 069533</p>
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
          <h2 className="mb-4 text-2xl font-bold">Questions About Our Terms?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            We're happy to clarify any aspect of our terms of service.
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
