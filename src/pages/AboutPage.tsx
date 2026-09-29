export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About TasaTrust</h1>
          <p className="text-xl text-gray-600">
            Your trusted partner in digital transformation
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At TasaTrust, we're dedicated to helping businesses succeed in the digital world.
            Our mission is to provide high-quality, affordable web development and digital
            marketing services that empower businesses to grow and thrive online.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Trust & Transparency</h3>
              <p className="text-gray-600">
                We build lasting relationships through honest communication and transparent pricing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Quality Excellence</h3>
              <p className="text-gray-600">
                We deliver exceptional quality in every project, never compromising on standards.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Customer Success</h3>
              <p className="text-gray-600">
                Your success is our success. We go above and beyond to help you achieve your goals.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We stay ahead of the curve with the latest technologies and best practices.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Team</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We're a team of passionate developers, designers, and digital marketers committed
            to delivering exceptional results. With years of combined experience, we bring
            expertise in web development, digital marketing, and business strategy to every project.
          </p>
        </div>
      </div>
    </div>
  );
}
