// Member Dashboard - Central Hub
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/stripe';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar, 
  CreditCard, 
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function MemberDashboard() {
  const { member, subscription } = useAuth();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'essential': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-[#BCA868]/20 text-[#BCA868]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tierBenefits = {
    basic: ['Business Address', 'Mail Alerts'],
    essential: ['Business Address', 'Mail Forwarding', '5 hrs Meeting Rooms'],
    professional: ['Business Address', 'Mail Forwarding', '10 hrs Meeting Rooms', 'FREE Website Build'],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2D5B5F]">
            Welcome back, {member?.contact_name || member?.company_name || 'Member'}!
          </h1>
          <p className="text-gray-600">
            Manage your subscription and services from here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#2D5B5F]/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-[#2D5B5F]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-xl font-bold text-[#2D5B5F] capitalize">
                  {subscription?.tier || 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Services</p>
                <p className="text-xl font-bold text-[#2D5B5F]">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#BCA868]/20 rounded-lg">
                <Clock className="w-6 h-6 text-[#BCA868]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing</p>
                <p className="text-xl font-bold text-[#2D5B5F]">Mar 5, 2026</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-xl font-bold text-[#2D5B5F]">Jan 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#2D5B5F]">
                    Your Subscription
                  </h2>
                  <Link 
                    to="/member/subscription"
                    className="text-[#2D5B5F] text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    Manage <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-4 py-2 rounded-full font-semibold capitalize ${getTierColor(subscription?.tier || 'basic')}`}>
                    {subscription?.tier || 'No Plan'} Plan
                  </span>
                  <span className="text-green-600 font-medium">
                    ● Active
                  </span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {tierBenefits[subscription?.tier as keyof typeof tierBenefits] || tierBenefits.basic.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-[#2D5B5F]">
                  Quick Actions
                </h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 p-6">
                <Link
                  to="/member/services"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="p-3 bg-[#2D5B5F]/10 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-[#2D5B5F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D5B5F]">Browse Services</h3>
                    <p className="text-sm text-gray-500">Add more services</p>
                  </div>
                </Link>

                <Link
                  to="/member/booking"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="p-3 bg-[#BCA868]/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-[#BCA868]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D5B5F]">Book Meeting</h3>
                    <p className="text-sm text-gray-500">Reserve a room</p>
                  </div>
                </Link>

                <Link
                  to="/member/subscription"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D5B5F]">Manage Billing</h3>
                    <p className="text-sm text-gray-500">Update payment</p>
                  </div>
                </Link>

                <Link
                  to="/member/settings"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D5B5F]">Account Settings</h3>
                    <p className="text-sm text-gray-500">Update profile</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Professional Tier Banner */}
            {subscription?.tier !== 'professional' && (
              <div className="bg-gradient-to-r from-[#2D5B5F] to-[#1A3D42] rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#BCA868] rounded-lg">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      Upgrade to Professional
                    </h3>
                    <p className="text-gray-200 mb-4">
                      Get a FREE website worth $1,499 and double your meeting room hours!
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        to="/pricing"
                        className="px-6 py-3 bg-[#BCA868] text-[#1A3D42] font-semibold rounded-lg hover:bg-[#A89858] transition-all"
                      >
                        Upgrade Now
                      </Link>
                      <span className="text-sm text-gray-300">
                        Only +$5.91/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-[#2D5B5F] mb-4">Account</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{member?.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{member?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{member?.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-[#2D5B5F] mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our team is here to support you with any questions.
              </p>
              <Link
                to="/contact"
                className="block w-full py-3 bg-[#2D5B5F] text-white text-center rounded-lg font-medium hover:bg-[#1A3D42] transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
