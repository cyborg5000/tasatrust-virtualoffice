// PayNow QR payload builder (SGQR / EMVCo MPM spec).
// Proxy: UEN (with optional suffix) or SG mobile (+65...). CRC-16/CCITT-FALSE over the payload.

function tlv(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function crc16ccitt(input: string) {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type PayNowOptions = {
  proxyType: "uen" | "mobile";
  proxyValue: string; // UEN e.g. 201912345K (optionally with suffix) or mobile 8 digits / +65XXXXXXXX
  merchantName: string;
  amount?: number; // omit for open amount
  editableAmount?: boolean;
  reference?: string; // bill/invoice reference
  expiry?: string; // YYYYMMDD (optional)
};

export function buildPayNowPayload(o: PayNowOptions) {
  const proxy =
    o.proxyType === "mobile"
      ? `+65${o.proxyValue.replace(/^\+?65/, "").replace(/\D/g, "")}`
      : o.proxyValue.trim().toUpperCase();

  const merchantAccount = tlv(
    "26",
    tlv("00", "SG.PAYNOW") +
      tlv("01", o.proxyType === "mobile" ? "0" : "2") +
      tlv("02", proxy) +
      tlv("03", o.editableAmount === false ? "0" : "1") +
      (o.expiry ? tlv("04", o.expiry) : "")
  );

  const name = (o.merchantName || "NA").slice(0, 25);
  let payload =
    tlv("00", "01") +
    tlv("01", "12") + // dynamic (12) — fine for both; static also scans
    merchantAccount +
    tlv("52", "0000") +
    tlv("53", "702") + // SGD
    (o.amount && o.amount > 0 ? tlv("54", o.amount.toFixed(2)) : "") +
    tlv("58", "SG") +
    tlv("59", name) +
    tlv("60", "Singapore") +
    (o.reference ? tlv("62", tlv("01", o.reference.slice(0, 25))) : "");

  payload += "6304";
  return payload + crc16ccitt(payload);
}
