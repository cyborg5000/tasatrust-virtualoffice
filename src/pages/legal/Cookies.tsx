import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function Cookies() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Cookie <span className="text-primary">Policy</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            How we use cookies and similar technologies.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="mb-4 text-2xl font-bold">1. What Are Cookies</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit our website. They are widely used to make websites work more efficiently and provide information to the website owners. Cookies can be "session cookies" (temporary cookies that are deleted when you close your browser) or "persistent cookies" (cookies that remain on your device for a set period or until you delete them).
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">2. Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Essential Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable core functionality such as page navigation, account authentication, and secure areas of the website. You cannot switch off essential cookies as the website would not function properly without them.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Performance Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve the performance of our website by showing us which pages are most popular and which need improvement.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Functionality Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies allow the website to remember choices you make (such as your language preference, region, or font size) and provide enhanced, more personal features. They may also be used to remember changes you've made to text size, fonts, and other customizable elements.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Targeting/Advertising Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies are used to track visitors across websites to display ads that are relevant and engaging for the individual user. They may be set by our advertising partners to build a profile of your interests and show you relevant ads on other sites.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">3. Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 text-left font-medium">Cookie Name</th>
                      <th className="py-3 text-left font-medium">Purpose</th>
                      <th className="py-3 text-left font-medium">Duration</th>
                      <th className="py-3 text-left font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3">session_id</td>
                      <td className="py-3">Maintain user session</td>
                      <td className="py-3">Session</td>
                      <td className="py-3">Essential</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">auth_token</td>
                      <td className="py-3">User authentication</td>
                      <td className="py-3">30 days</td>
                      <td className="py-3">Essential</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">preferences</td>
                      <td className="py-3">Store user preferences</td>
                      <td className="py-3">1 year</td>
                      <td className="py-3">Functionality</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">analytics_id</td>
                      <td className="py-3">Track website usage</td>
                      <td className="py-3">2 years</td>
                      <td className="py-3">Performance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">4. Similar Technologies</h2>
              <p className="mb-4 text-muted-foreground">
                In addition to cookies, we may also use similar technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Web Beacons:</strong> Small graphic images (also called "pixels" or "clear GIFs") that help us understand how users interact with our website.</li>
                <li><strong>Local Storage:</strong> Browser storage mechanisms that allow us to store data locally on your device.</li>
                <li><strong>IP Addresses:</strong> We may collect IP addresses for security purposes and to understand website traffic patterns.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">5. Third-Party Cookies</h2>
              <p className="mb-4 text-muted-foreground">
                Some cookies are placed by third-party services that appear on our pages. We may use third-party services for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Website analytics (e.g., Google Analytics)</li>
                <li>Payment processing</li>
                <li>Social media integration</li>
                <li>Marketing and advertising</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                We do not control these third-party cookies. Please refer to the respective privacy and cookie policies of these third parties for more information about their practices.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">6. Managing Cookies</h2>
              <p className="mb-4 text-muted-foreground">
                You have several options for managing cookies:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>
                  <strong>Browser Settings:</strong> Most browsers allow you to refuse, accept, or delete cookies. The method for doing this varies by browser. Please check your browser's help menu for instructions.
                </li>
                <li>
                  <strong>Third-Party Opt-Out:</strong> You can opt-out of specific third-party cookies by visiting:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://tools.google.com/dlpage/gaoptout</a></li>
                  </ul>
                </li>
                <li>
                  <strong>Industry Opt-Out:</strong> Visit <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://optout.aboutads.info/</a> to opt-out of many advertising cookies.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">7. Impact of Disabling Cookies</h2>
              <p className="text-muted-foreground">
                If you disable or delete cookies, some features of our website may not function properly. For example, you may not be able to log in to your account, save preferences, or use certain interactive features. Essential cookies cannot be disabled as they are required for the basic functioning of the website.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">8. Updates to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Modified" date.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about our use of cookies, please contact us at:
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
          <h2 className="mb-4 text-2xl font-bold">Questions About Cookies?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            We're happy to explain more about how we use cookies.
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
