import { useState } from 'react';

export default function AdminPricing() {
  const [plans] = useState([
    {
      id: 1,
      name: 'Basic',
      price: 99,
      billing: 'monthly',
      features: ['5 Web Pages', 'Basic SEO', 'Email Support'],
      subscribers: 24
    },
    {
      id: 2,
      name: 'Professional',
      price: 199,
      billing: 'monthly',
      features: ['15 Web Pages', 'Advanced SEO', 'Priority Support'],
      subscribers: 18
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 499,
      billing: 'monthly',
      features: ['Unlimited Pages', 'Full SEO Suite', '24/7 Support'],
      subscribers: 7
    }
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pricing Management</h1>
          <p className="text-gray-600">Manage subscription tiers and pricing</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${plan.price}
                  <span className="text-sm text-gray-600">/{plan.billing}</span>
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Features:</p>
              <ul className="space-y-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {feature}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{plan.subscribers}</span> active subscribers
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Edit
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
