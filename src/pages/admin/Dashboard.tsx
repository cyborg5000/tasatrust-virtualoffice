// Admin Dashboard - Platform Management
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Activity,
  Calendar,
  Globe,
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Stats {
  mrr: number;
  totalMembers: number;
  activeSubscriptions: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  member_email: string;
  service_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    mrr: 0,
    totalMembers: 0,
    activeSubscriptions: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simulated data - replace with actual API calls
    setStats({
      mrr: 540,
      totalMembers: 28,
      activeSubscriptions: 24,
      monthlyOrders: 12,
      monthlyRevenue: 3240,
    });

    setRecentOrders([
      {
        id: '1',
        member_email: 'john@startup.com',
        service_name: 'Website Build - Essential',
        amount: 499,
        status: 'completed',
        created_at: '2026-02-05 10:30:00',
      },
      {
        id: '2',
        member_email: 'sarah@agency.com',
        service_name: 'Professional Subscription',
        amount: 24.90,
        status: 'pending',
        created_at: '2026-02-05 09:15:00',
      },
      {
        id: '3',
        member_email: 'mike@consulting.io',
        service_name: 'Logo Design',
        amount: 499,
        status: 'completed',
        created_at: '2026-02-04 16:45:00',
      },
    ]);

    setLoading(false);
  };

  const statCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: `$${stats.mrr.toLocaleString()}`,
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Total Members',
      value: stats.totalMembers.toString(),
      change: '+5',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toString(),
      change: '+3',
      trend: 'up',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Monthly Orders',
      value: stats.monthlyOrders.toString(),
      change: '+8',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-[#2D5B5F]',
      bg: 'bg-[#2D5B5F]/10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D5B5F]">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your TasaTrust platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-[#2D5B5F] text-white rounded-lg hover:bg-[#1A3D42] transition-all"
            >
              <Globe className="w-4 h-4" />
              View Site
            </Link>
            <Link
              to="/admin/settings"
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-all"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-[#2D5B5F]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#2D5B5F]">
                  Recent Orders
                </h2>
                <Link 
                  to="/admin/orders"
                  className="text-[#2D5B5F] text-sm font-medium hover:underline"
                >
                  View All
                </Link>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  Loading orders...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-[#2D5B5F]">
                              {order.member_email}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-600">
                              {order.service_name}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-[#2D5B5F]">
                              ${order.amount.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Subscription Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#2D5B5F] mb-6">
                Subscription Distribution
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-100 rounded-xl">
                  <p className="text-3xl font-bold text-gray-600">5</p>
                  <p className="text-sm text-gray-500">Basic</p>
                </div>
                <div className="text-center p-4 bg-blue-100 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-blue-600">Essential</p>
                </div>
                <div className="text-center p-4 bg-[#BCA868]/20 rounded-xl">
                  <p className="text-3xl font-bold text-[#BCA868]">7</p>
                  <p className="text-sm text-[#BCA868]">Professional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-[#2D5B5F] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/services"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <Settings className="w-5 h-5 text-[#2D5B5F]" />
                  <span className="text-sm font-medium">Manage Services</span>
                </Link>
                <Link
                  to="/admin/pricing"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <DollarSign className="w-5 h-5 text-[#2D5B5F]" />
                  <span className="text-sm font-medium">Update Pricing</span>
                </Link>
                <Link
                  to="/admin/website-builds"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <Globe className="w-5 h-5 text-[#2D5B5F]" />
                  <span className="text-sm font-medium">Website Builds</span>
                </Link>
                <Link
                  to="/admin/analytics"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <TrendingUp className="w-5 h-5 text-[#2D5B5F]" />
                  <span className="text-sm font-medium">View Analytics</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-[#2D5B5F] mb-4">
                Upcoming Renewals
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2D5B5F]/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#2D5B5F]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah @ Agency</p>
                    <p className="text-xs text-gray-500">Renews Feb 10</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2D5B5F]/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#2D5B5F]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mike @ Consulting</p>
                    <p className="text-xs text-gray-500">Renews Feb 15</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue This Month */}
            <div className="bg-gradient-to-br from-[#2D5B5F] to-[#1A3D42] rounded-xl p-6 text-white">
              <p className="text-sm text-gray-300 mb-2">Revenue This Month</p>
              <p className="text-3xl font-bold">$3,240</p>
              <p className="text-sm text-gray-300 mt-2">
                +$480 from last month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
