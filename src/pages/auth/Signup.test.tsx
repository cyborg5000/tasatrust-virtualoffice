import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Signup from "./Signup";
import { SIGNUP_MIN_ELAPSED_MS } from "@/lib/signupAbuse";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={["/signup"]}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/member/onboarding" element={<div>Member onboarding</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function completeSignupForm() {
  fireEvent.change(screen.getByLabelText("Company Name"), {
    target: { value: "Example Company Pte. Ltd." },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "Owner@Example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "correct-horse" },
  });
  fireEvent.change(screen.getByLabelText("Verification"), {
    target: { value: "TRUST" },
  });
}

describe("Signup", () => {
  let now = new Date("2026-05-12T10:00:00Z").getTime();
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    now = new Date("2026-05-12T10:00:00Z").getTime();
    dateNowSpy = vi.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it("creates only the Auth user and stores company metadata", async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {
        user: { id: "user_123" },
        session: { access_token: "token" },
      },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.signUp>>);

    renderSignup();
    now += SIGNUP_MIN_ELAPSED_MS + 1;
    completeSignupForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "owner@example.com",
        password: "correct-horse",
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            company_name: "Example Company Pte. Ltd.",
          },
        },
      });
    });

    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(await screen.findByText("Member onboarding")).toBeInTheDocument();
  });

  it("blocks submissions that fail the verification guard", async () => {
    renderSignup();
    now += SIGNUP_MIN_ELAPSED_MS + 1;
    completeSignupForm();
    fireEvent.change(screen.getByLabelText("Verification"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please complete the verification check.");
    });
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });
});
