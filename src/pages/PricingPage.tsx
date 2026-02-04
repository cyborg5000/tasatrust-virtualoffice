// Pricing Page - Core Business Model
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { supabaseHelpers } from '../lib/supabase';
import { PRICING_TIERS, formatPrice, calculateSavings } from '../lib/stripe';

interface Service {
  id: string;
  name: string;
  description: string;
  type: string;
  visibility: string;
  service_pricing: {
    tier: string;
    is_included: boolean;
    one_time_price: number;
    recurring_price: number;
  }[];
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await supabaseHelpers.getServices();
    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  const getServicePrice = (service: Service, tier: string, isOneTime: boolean = false) => {
    const pricing = service.service_pricing.find(p => p.tier === tier);
    if (!pricing) return null;
    
    if (pricing.is_included) {
      return { price: 0, label: 'INCLUDED', included: true };
    }
    
    return {
      price: isOneTime ? pricing.one_time_price : pricing.recurring_price,
      label: formatPrice(isOneTime ? pricing.one_time_price : pricing.recurring_price),
      included: false,
    };
  };

  const tiers = ['basic', 'essential', 'professional'];
  const tierNames = { basic: 'Basic', essential: 'Essential', professional: 'Professional' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2D5B5F] to-[#1A3D42] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Choose the perfect virtual office plan for your business. 
            Add services as you need them.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#2D5B5F]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-[#BCA868] text-[#1A3D42]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Annual
              <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                Save 12%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {tiers.map((tier) => {
              const tierData = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];
              const price = billingCycle === 'annual' ? tierData.annualPrice : tierData.monthlyPrice;
              const savings = calculateSavings(tierData.monthlyPrice, tierData.annualPrice);
              
              return (
                <div
                  key={tier}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden relative ${
                    tier === 'professional' ? 'ring-2 ring-[#BCA868] scale-105' : ''
                  }`}
                >
                  {tier === 'professional' && (
                    <div className="bg-[#BCA868] text-white text-center py-2 font-semibold">
                      <Sparkles className="inline w-4 h-4 mr-2" />
                      BEST VALUE - FREE WEBSITE
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#2D5B5F] mb-2">
                      {tierNames[tier as keyof typeof tierNames]}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-bold text-[#2D5B5F]">
                        ${price.toFixed(2)}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-green-600 mb-4">
                        Billed ${(price * 12).toFixed(2)} annually
                      </p>
                    )}
                    
                    {/* Tier Features */}
                    <ul className="space-y-4 mb-8">
                      {tierData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Add-on Services */}
                    <div className="border-t pt-6 mb-6">
                      <h4 className="font-semibold text-[#2D5B5F] mb-4">
                        Available Add-ons
                      </h4>
                      
                      {loading ? (
                        <p className="text-gray-500">Loading services...</p>
                      ) : (
                        <div className="space-y-3">
                          {services
                            .filter(s => s.visibility === 'pricing_page')
                            .slice(0, 3)
                            .map(service => {
                              const pricing = getServicePrice(service, tier);
                              return pricing ? (
                                <div 
                                  key={service.id}
                                  className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    {pricing.included ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <span className="text-gray-400">+</span>
                                    )}
                                    <span>{service.name}</span>
                                  </div>
                                  <span className="font-medium">
                                    {pricing.included ? (
                                      <span className="text-green-600">FREE</span>
                                    ) : (
                                      `From ${pricing.label}`
                                    )}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          
                          <Link 
                            to="/services"
                            className="block text-center text-[#2D5B5F] text-sm font-medium hover:underline"
                          >
                            View all add-ons
                            <ArrowRight className="inline w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to="/register"
                      className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                        tier === 'professional'
                          ? 'bg-[#2D5B5F] text-white hover:bg-[#1A3D42]'
                          : 'bg-[#2D5B5F]/10 text-[#2D5B5F] hover:bg-[#2D5B5F]/20'
                      }`}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#2D5B5F] mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#2D5B5F] mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect on your next billing cycle.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#2D5B5F] mb-2">
                What's included in the FREE website build?
              </h3>
              <p className="text-gray-600">
                Professional tier members get a complete website build worth $1,499 
                absolutely free. Includes design, development, and launch.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#2D5B5F] mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, cancel anytime with no hidden fees or penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#2D5B5F] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of businesses using TasaTrust for their virtual office needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#BCA868] text-[#1A3D42] font-semibold rounded-xl hover:bg-[#A89858] transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
