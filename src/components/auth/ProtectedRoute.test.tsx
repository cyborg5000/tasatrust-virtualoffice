import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { useMemberSubscription } from "@/hooks/useMemberSubscription";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useAdminMemberView", () => ({
  useAdminMemberView: vi.fn(),
}));

vi.mock("@/hooks/useMemberSubscription", () => ({
  useMemberSubscription: vi.fn(),
}));

function mockSignedInAdminMemberView({
  hasActiveSubscription,
  loading = false,
}: {
  hasActiveSubscription: boolean;
  loading?: boolean;
}) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: "admin_123", email: "admin@tasatrust.com" },
    session: null,
    loading: false,
    signOut: vi.fn(),
  } as unknown as ReturnType<typeof useAuth>);

  vi.mocked(useAdminMemberView).mockReturnValue({
    userId: "admin_123",
    userEmail: "admin@tasatrust.com",
    effectiveMemberId: "b610b9a1-b2f8-4091-b240-b0fe126311ff",
    effectiveMemberEmail: "acruz@axctrust.com",
    isAdmin: true,
    loading,
    selectedMember: {
      id: "b610b9a1-b2f8-4091-b240-b0fe126311ff",
      company_name: "WC ALEXANDER TRUST",
      contact_name: null,
      email: "acruz@axctrust.com",
    },
    selectedMemberId: "b610b9a1-b2f8-4091-b240-b0fe126311ff",
    isViewingAsMember: true,
    viewAsMember: vi.fn(),
    returnToAdminView: vi.fn(),
    clearMemberView: vi.fn(),
  } as ReturnType<typeof useAdminMemberView>);

  vi.mocked(useMemberSubscription).mockReturnValue({
    subscription: hasActiveSubscription
      ? {
          id: "sub_row_123",
          member_id: "b610b9a1-b2f8-4091-b240-b0fe126311ff",
          tier: "basic",
          status: "active",
          stripe_subscription_id: "sub_1TUs1WBrlsYQJWt1KjTmv8iA",
          current_period_start: "2026-05-08T17:17:14Z",
          current_period_end: "2027-05-08T17:17:14Z",
          cancel_at_period_end: false,
          created_at: "2026-05-12T10:25:36Z",
          updated_at: "2026-05-12T10:25:36Z",
        }
      : null,
    hasActiveSubscription,
    loading: false,
    refresh: vi.fn(),
  } as ReturnType<typeof useMemberSubscription>);
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks the selected member subscription when admin is viewing as a paid member", () => {
    mockSignedInAdminMemberView({ hasActiveSubscription: true });

    render(
      <MemoryRouter initialEntries={["/member"]}>
        <Routes>
          <Route
            path="/member"
            element={
              <ProtectedRoute requireSubscription>
                <div>Member dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/member/onboarding" element={<div>Member onboarding</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Member dashboard")).toBeInTheDocument();
    expect(useMemberSubscription).toHaveBeenCalledWith(
      "b610b9a1-b2f8-4091-b240-b0fe126311ff",
      { reconcileProfile: false },
    );
  });

  it("redirects a paid selected member away from onboarding", async () => {
    mockSignedInAdminMemberView({ hasActiveSubscription: true });

    render(
      <MemoryRouter initialEntries={["/member/onboarding"]}>
        <Routes>
          <Route
            path="/member/onboarding"
            element={
              <ProtectedRoute onlyWithoutSubscription>
                <div>Member onboarding</div>
              </ProtectedRoute>
            }
          />
          <Route path="/member" element={<div>Member dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Member dashboard")).toBeInTheDocument();
    });
    expect(screen.queryByText("Member onboarding")).not.toBeInTheDocument();
  });

  it("waits for the admin member-view context before checking subscription", () => {
    mockSignedInAdminMemberView({ hasActiveSubscription: false, loading: true });

    render(
      <MemoryRouter initialEntries={["/member"]}>
        <ProtectedRoute requireSubscription>
          <div>Member dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Member dashboard")).not.toBeInTheDocument();
    expect(useMemberSubscription).toHaveBeenCalledWith(undefined, { reconcileProfile: false });
  });
});
