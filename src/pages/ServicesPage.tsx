export default function ServicesPage() {
  const services = [
    {
      title: 'Web Development',
      description: 'Custom websites and web applications built with modern technologies',
      features: ['Responsive Design', 'E-commerce Solutions', 'CMS Integration', 'API Development']
    },
    {
      title: 'Digital Marketing',
      description: 'Comprehensive digital marketing strategies to grow your online presence',
      features: ['SEO Optimization', 'Social Media Marketing', 'Content Marketing', 'Email Campaigns']
    },
    {
      title: 'Business Tools',
      description: 'Essential tools and software solutions for business operations',
      features: ['Project Management', 'Analytics & Reporting', 'Automation Tools', 'CRM Systems']
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">
            Comprehensive solutions to help your business thrive in the digital age
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
