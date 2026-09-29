export default function AdminAnalytics() {
  const stats = {
    revenue: { current: '$24,580', change: '+12.5%', trend: 'up' },
    members: { current: '142', change: '+8.3%', trend: 'up' },
    orders: { current: '89', change: '-3.2%', trend: 'down' },
    projects: { current: '34', change: '+15.7%', trend: 'up' }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600">Monitor business performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-600 text-sm capitalize">{key}</p>
              <span className={`text-xs font-semibold ${
                value.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {value.change}
              </span>
            </div>
            <p className="text-3xl font-bold">{value.current}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart visualization will be implemented</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Member Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart visualization will be implemented</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">New member signup</p>
              <p className="text-sm text-gray-600">John Doe joined Professional tier</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Order completed</p>
              <p className="text-sm text-gray-600">Website development for Jane Smith</p>
            </div>
            <span className="text-sm text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Payment received</p>
              <p className="text-sm text-gray-600">$199 from Bob Johnson</p>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">New project started</p>
              <p className="text-sm text-gray-600">E-commerce site for Alice Brown</p>
            </div>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
