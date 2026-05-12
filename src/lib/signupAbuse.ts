export const SIGNUP_VERIFICATION_WORD = "trust";
export const SIGNUP_MIN_ELAPSED_MS = 1500;

type SignupGuardInput = {
  trapValue: string;
  verificationValue: string;
  elapsedMs: number;
};

type SignupGuardResult = {
  ok: boolean;
  message?: string;
};

type MemberReviewInput = {
  companyName: string;
  email: string;
  createdAt?: string | null;
  hasSubscription: boolean;
  orderCount?: number;
};

const KNOWN_ATTACK_WINDOW_START = Date.UTC(2026, 3, 13);
const KNOWN_ATTACK_WINDOW_END = Date.UTC(2026, 3, 22);
const SUSPICIOUS_DOMAINS = new Set([
  "emlhub.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "vtext.com",
]);

export function cleanSignupCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSignupEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateSignupGuard({
  trapValue,
  verificationValue,
  elapsedMs,
}: SignupGuardInput): SignupGuardResult {
  if (trapValue.trim().length > 0) {
    return {
      ok: false,
      message: "We could not verify this signup. Please refresh and try again.",
    };
  }

  if (elapsedMs < SIGNUP_MIN_ELAPSED_MS) {
    return {
      ok: false,
      message: "Please wait a moment and try again.",
    };
  }

  if (verificationValue.trim().toLowerCase() !== SIGNUP_VERIFICATION_WORD) {
    return {
      ok: false,
      message: "Please complete the verification check.",
    };
  }

  return { ok: true };
}

function isRandomLookingCompanyName(companyName: string) {
  const compact = companyName.trim();
  if (!/^[A-Za-z]{14,}$/.test(compact)) return false;

  const uppercaseCount = (compact.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (compact.match(/[a-z]/g) || []).length;
  const caseTransitions = (compact.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;

  return uppercaseCount >= 4 && lowercaseCount >= 4 && caseTransitions >= 6;
}

function hasDottedThrowawayPattern(emailLocalPart: string) {
  const dotCount = (emailLocalPart.match(/\./g) || []).length;
  const shortSegments = emailLocalPart.split(".").filter((segment) => segment.length > 0 && segment.length <= 2);

  return dotCount >= 4 || shortSegments.length >= 4;
}

function wasCreatedDuringKnownAttackWindow(createdAt?: string | null) {
  if (!createdAt) return false;
  const timestamp = new Date(createdAt).getTime();
  if (Number.isNaN(timestamp)) return false;

  return timestamp >= KNOWN_ATTACK_WINDOW_START && timestamp < KNOWN_ATTACK_WINDOW_END;
}

export function getMemberReviewSignals({
  companyName,
  email,
  createdAt,
  hasSubscription,
  orderCount = 0,
}: MemberReviewInput) {
  if (hasSubscription || orderCount > 0) return [];

  const normalizedEmail = normalizeSignupEmail(email);
  const [localPart = "", domain = ""] = normalizedEmail.split("@");
  const signals: string[] = [];

  if (isRandomLookingCompanyName(companyName)) {
    signals.push("random-looking company name");
  }

  if (hasDottedThrowawayPattern(localPart)) {
    signals.push("dotted throwaway email pattern");
  }

  if (SUSPICIOUS_DOMAINS.has(domain)) {
    signals.push("disposable or SMS email domain");
  }

  if (wasCreatedDuringKnownAttackWindow(createdAt)) {
    signals.push("created during the April signup-abuse burst");
  }

  return signals;
}

export function isMemberReviewCandidate(input: MemberReviewInput) {
  return getMemberReviewSignals(input).length > 0;
}
