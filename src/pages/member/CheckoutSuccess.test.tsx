import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutSuccess from "./CheckoutSuccess";
import { supabase } from "@/integrations/supabase/client";
import { useMemberSubscription } from "@/hooks/useMemberSubscription";

const refreshMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user_123", email: "acruz@axctrust.com" },
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/hooks/useMemberSubscription", () => ({
  useMemberSubscription: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

function renderCheckoutSuccess() {
  return render(
    <MemoryRouter initialEntries={["/member/checkout/success?session_id=cs_test_123"]}>
      <Routes>
        <Route path="/member/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/member" element={<div>Member dashboard</div>} />
        <Route path="/member/onboarding" element={<div>Member onboarding</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CheckoutSuccess", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    refreshMock.mockResolvedValue(undefined);
    vi.mocked(useMemberSubscription).mockReturnValue({
      subscription: null,
      hasActiveSubscription: false,
      loading: false,
      refresh: refreshMock,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("reconciles the checkout session and redirects when activation succeeds", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { activated: true },
      error: null,
    });

    renderCheckoutSuccess();

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith("reconcile-checkout-session", {
        body: { sessionId: "cs_test_123" },
      });
    });

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
      expect(screen.getByText("Member dashboard")).toBeInTheDocument();
    });
  });

  it("shows a support-safe state instead of sending a customer back to onboarding", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error("Checkout session is not paid yet."),
    });

    renderCheckoutSuccess();

    expect(await screen.findByText("Contact Support")).toBeInTheDocument();
    expect(screen.getByText(/could not automatically confirm/i)).toBeInTheDocument();
    expect(screen.queryByText("Back to Onboarding")).not.toBeInTheDocument();
    expect(screen.queryByText("Member onboarding")).not.toBeInTheDocument();
  });
});
