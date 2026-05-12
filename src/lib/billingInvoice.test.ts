import { describe, expect, it } from "vitest";
import {
  buildInvoiceDetails,
  getCustomerPaymentReference,
  getCurrentPlanRateText,
  inferSubscriptionBillingCycle,
  type BillingOrder,
} from "@/lib/billingInvoice";
import type { Tables } from "@/integrations/supabase/types";

const annualSubscription: Tables<"subscriptions"> = {
  id: "sub-1",
  member_id: "member-1",
  tier: "essential",
  status: "active",
  stripe_subscription_id: "sub_stripe",
  current_period_start: "2026-05-01T00:00:00.000Z",
  current_period_end: "2027-05-01T00:00:00.000Z",
  cancel_at_period_end: false,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
};

const annualOrder: BillingOrder = {
  id: "12345678-0000-0000-0000-000000000000",
  member_id: "member-1",
  service_id: null,
  type: "subscription",
  amount: 203.88,
  status: "completed",
  stripe_payment_intent_id: "checkout:cs_test:plan",
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
};

describe("billing invoice helpers", () => {
  it("shows annual subscriptions as yearly totals instead of monthly rates", () => {
    const cycle = inferSubscriptionBillingCycle(annualSubscription, [annualOrder]);

    expect(cycle).toBe("annual");
    expect(getCurrentPlanRateText(annualSubscription, cycle)).toBe("$203.88/year");
  });

  it("builds annual invoice line items without a per-month suffix", () => {
    const invoice = buildInvoiceDetails({
      order: annualOrder,
      member: {
        company_name: "Example Company Pte. Ltd.",
        contact_name: "Example Contact",
        email: "billing@example.com",
        phone: null,
      },
      subscription: annualSubscription,
      subscriptionBillingCycle: "annual",
    });

    expect(invoice.invoiceNumber).toBe("INV-12345678");
    expect(invoice.lineItems[0].periodLabel).toBe("Annual billing");
    expect(invoice.lineItems[0].amountLabel).toBe("$203.88/year");
    expect(invoice.lineItems[0].amountLabel).not.toContain("/month");
  });

  it("hides internal checkout dedupe wrappers from customer payment references", () => {
    expect(getCustomerPaymentReference("checkout:cs_live_abc123:plan")).toBe(
      "Stripe Checkout Ref - abc123",
    );
    expect(getCustomerPaymentReference("checkout:cs_test_def456:addon:recurring")).toBe(
      "Stripe Checkout Ref - def456",
    );
  });

  it("shortens long Stripe checkout references for invoices", () => {
    expect(
      getCustomerPaymentReference(
        "checkout:cs_live_b1Jxjs8yhAR3n3FIC1k2Y5fUvPsVrQlIju4qAsnJWW8p8uqLw4ZIBWqeqa:plan",
      ),
    ).toBe("Stripe Checkout Ref - BWqeqa");
  });
});
