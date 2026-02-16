export type ResendSendInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type ResendSendResult = {
  ok: boolean;
  status: number;
  id?: string;
  error?: string;
};

const DEFAULT_FROM_ADDRESS = "no-reply@tasatrust.com";
const DEFAULT_ADMIN_ADDRESSES = ["admin@tasatrust.com", "business+tasatrust@5amuelchan.com"];

function cleanText(value: string | null | undefined) {
  if (!value) return "";
  return value.trim();
}

function splitEmailList(value: string) {
  return value
    .split(/[;,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

export function normalizeEmail(value: string | null | undefined) {
  return cleanText(value).toLowerCase();
}

export function normalizeEmailList(
  value: string | null | undefined,
  fallback: string[] = [],
) {
  const base = splitEmailList(cleanText(value || ""));

  if (base.length === 0) {
    return Array.from(new Set(fallback.map((email) => normalizeEmail(email)))).filter(Boolean);
  }

  return Array.from(new Set(base));
}

export function getResendFromAddress() {
  return DEFAULT_FROM_ADDRESS;
}

export function getAdminNotificationEmails() {
  return DEFAULT_ADMIN_ADDRESSES;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'\"]/g, (match) => {
    const mapping: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return mapping[match];
  });
}

export async function sendResendEmail(input: ResendSendInput): Promise<ResendSendResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY") || Deno.env.get("RESEND_TOKEN");
  const recipients = normalizeEmailList(Array.isArray(input.to) ? input.to.join(",") : input.to);

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: "Missing RESEND_API_KEY in function environment.",
    };
  }

  if (recipients.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "No recipients provided.",
    };
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFromAddress(),
        to: recipients,
        reply_to: input.replyTo,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: error instanceof Error ? error.message : "Unable to contact Resend API.",
    };
  }

  const responseText = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: responseText,
    };
  }

  let messageId: string | undefined;

  try {
    const payload = JSON.parse(responseText);
    messageId = payload?.id;
  } catch {
    messageId = undefined;
  }

  return {
    ok: true,
    status: response.status,
    id: messageId,
  };
}
