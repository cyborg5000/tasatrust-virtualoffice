// Stripe Integration
import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Pricing configuration - matches database
export const PRICING_TIERS = {
  basic: {
    name: 'Basic',
    monthlyPrice: 17.99,
    annualPrice: 15.99,
    features: [
      'Business Address',
      'Mail Alerts',
    ],
  },
  essential: {
    name: 'Essential',
    monthlyPrice: 18.99,
    annualPrice: 16.99,
    features: [
      'Business Address',
      'Mail Forwarding',
      '5 hours Meeting Rooms',
    ],
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 26.90,
    annualPrice: 24.90,
    features: [
      'Business Address',
      'Mail Forwarding + Package',
      '10 hours Meeting Rooms',
      'FREE Website Build ($1,499 value)',
    ],
  },
};

// Stripe price IDs (create these in Stripe Dashboard)
export const STRIPE_PRICES = {
  basic_monthly: 'price_basic_monthly_id',
  basic_annual: 'price_basic_annual_id',
  essential_monthly: 'price_essential_monthly_id',
  essential_annual: 'price_essential_annual_id',
  professional_monthly: 'price_professional_monthly_id',
  professional_annual: 'price_professional_annual_id',
};

// Helper to create checkout session
export const createCheckoutSession = async (
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
) => {
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId,
      successUrl: successUrl || `${window.location.origin}/checkout/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/pricing`,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }
  
  return response.json();
};

// Helper to create customer portal session
export const createPortalSession = async (customerId: string) => {
  const response = await fetch('/api/stripe/create-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }
  
  return response.json();
};

// Format price for display
export const formatPrice = (price: number, currency = 'SGD') => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
  }).format(price);
};

// Calculate monthly vs annual savings
export const calculateSavings = (monthly: number, annual: number) => {
  const monthlyTotal = monthly * 12;
  const annualTotal = annual * 12;
  const savings = monthlyTotal - annualTotal;
  const savingsPercent = ((savings / monthlyTotal) * 100).toFixed(0);
  return { savings, savingsPercent: Number(savingsPercent) };
};

export default {
  getStripe,
  createCheckoutSession,
  createPortalSession,
  formatPrice,
  PRICING_TIERS,
  STRIPE_PRICES,
};
