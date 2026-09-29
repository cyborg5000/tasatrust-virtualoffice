export default function MemberServices() {
  const services = [
    {
      name: 'Web Development',
      description: 'Professional website development services',
      status: 'Available',
      price: 'Included in plan'
    },
    {
      name: 'SEO Optimization',
      description: 'Search engine optimization to boost visibility',
      status: 'Available',
      price: 'Included in plan'
    },
    {
      name: 'Social Media Management',
      description: 'Professional social media strategy and management',
      status: 'Available',
      price: 'Included in plan'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Services</h1>
        <p className="text-gray-600">Access your available services and request new ones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">{service.status}</span>
              <span className="text-sm text-gray-500">{service.price}</span>
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Request Service
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
