import { useAuth } from '../../context/AuthContext';

export default function MemberSubscription() {
  const { subscription } = useAuth();

  const tiers = [
    {
      name: 'Basic',
      price: '$99',
      features: ['5 Web Pages', 'Basic SEO', 'Email Support', 'Monthly Reports']
    },
    {
      name: 'Professional',
      price: '$199',
      features: ['15 Web Pages', 'Advanced SEO', 'Priority Support', 'Weekly Reports', 'Social Media Management']
    },
    {
      name: 'Enterprise',
      price: '$499',
      features: ['Unlimited Pages', 'Full SEO Suite', '24/7 Support', 'Daily Reports', 'Dedicated Account Manager', 'Custom Development']
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {subscription?.tier || 'No active subscription'}
            </p>
            <p className="text-gray-600 mt-1">
              {subscription?.status === 'active' ? 'Active subscription' : 'Inactive'}
            </p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Manage Billing
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 ${
                subscription?.tier === tier.name ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                {tier.price}<span className="text-sm text-gray-600">/month</span>
              </p>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full px-4 py-2 rounded-lg ${
                  subscription?.tier === tier.name
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={subscription?.tier === tier.name}
              >
                {subscription?.tier === tier.name ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
