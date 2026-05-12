import { describe, expect, it } from "vitest";
import {
  getMemberReviewSignals,
  isMemberReviewCandidate,
  SIGNUP_MIN_ELAPSED_MS,
  validateSignupGuard,
} from "./signupAbuse";

describe("signup abuse guards", () => {
  it("rejects bot-trap and missing verification submissions", () => {
    expect(
      validateSignupGuard({
        trapValue: "https://example.com",
        verificationValue: "trust",
        elapsedMs: SIGNUP_MIN_ELAPSED_MS + 1,
      }).ok,
    ).toBe(false);

    expect(
      validateSignupGuard({
        trapValue: "",
        verificationValue: "",
        elapsedMs: SIGNUP_MIN_ELAPSED_MS + 1,
      }).ok,
    ).toBe(false);
  });

  it("allows a human-paced verified signup", () => {
    expect(
      validateSignupGuard({
        trapValue: "",
        verificationValue: "TRUST",
        elapsedMs: SIGNUP_MIN_ELAPSED_MS + 1,
      }),
    ).toEqual({ ok: true });
  });

  it("flags no-activity members from the April signup-abuse burst", () => {
    const signals = getMemberReviewSignals({
      companyName: "XwUzsNBNLbkwQqXOO",
      email: "d.e.l.si.o.mot.a@gmail.com",
      createdAt: "2026-04-21T16:47:31.459765+00:00",
      hasSubscription: false,
      orderCount: 0,
    });

    expect(signals).toContain("random-looking company name");
    expect(signals).toContain("dotted throwaway email pattern");
    expect(signals).toContain("created during the April signup-abuse burst");
  });

  it("does not flag paid or order-bearing members", () => {
    expect(
      isMemberReviewCandidate({
        companyName: "XwUzsNBNLbkwQqXOO",
        email: "d.e.l.si.o.mot.a@gmail.com",
        createdAt: "2026-04-21T16:47:31.459765+00:00",
        hasSubscription: true,
        orderCount: 0,
      }),
    ).toBe(false);

    expect(
      isMemberReviewCandidate({
        companyName: "XwUzsNBNLbkwQqXOO",
        email: "d.e.l.si.o.mot.a@gmail.com",
        createdAt: "2026-04-21T16:47:31.459765+00:00",
        hasSubscription: false,
        orderCount: 1,
      }),
    ).toBe(false);
  });
});
