import type { CSSProperties } from "react";
import type { Donation } from "../../types";

/** Emoji glyph shown next to each payment method in the table. */
export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  شيك: "🏦",
  "تحويل بنكي": "↔️",
  "STC Pay": "📱",
  "بطاقة رقمية": "💳",
  "Apple Pay": "🍎",
  نقد: "💵",
};

export const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** Fields a user can map an imported column to. */
export const POSSIBLE_FIELDS = [
  { value: "donationNumber", label: "رقم التبرع" },
  { value: "name", label: "اسم المتبرع" },
  { value: "phone", label: "الجوال" },
  { value: "projectName", label: "اسم المشروع" },
  { value: "amount", label: "قيمة التبرع" },
  { value: "paymentMethod", label: "طريقة الدفع" },
  { value: "bank", label: "البنك" },
  { value: "accountNumber", label: "رقم الحساب" },
  { value: "status", label: "الحالة" },
  { value: "source", label: "مصدر التبرع" },
  { value: "date", label: "وقت التبرع" },
] as const;

export const PAGE_SIZE = 20;

/** Shared inline style for the filter <select> elements. */
export const selStyle: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid rgba(45, 122, 82, 0.15)",
  fontFamily: "'Tajawal','Cairo',sans-serif",
  fontSize: "0.82rem",
  color: "#374151",
  background: "white",
  transition: "all 0.2s ease",
  outline: "none",
};

/** Arabic column headers used by the donations table. */
export const TABLE_HEADERS: string[] = [
  "رقم التبرع",
  "اسم المتبرع",
  "الجوال",
  "اسم المشروع",
  "قيمة التبرع",
  "طريقة الدفع",
  "الحالة",
  "مصدر التبرع",
  "وقت التبرع",
];

/** Full header set used by the xlsx export / template (includes bank fields). */
export const EXPORT_HEADERS: string[] = [
  "رقم التبرع",
  "اسم المتبرع",
  "الجوال",
  "اسم المشروع",
  "قيمة التبرع",
  "طريقة الدفع",
  "البنك",
  "رقم الحساب",
  "الحالة",
  "مصدر التبرع",
  "وقت التبرع",
];

/** Format a number for display using the user's locale. */
export const formatAmount = (n: number): string => n.toLocaleString();

/** Arabic label for a donation status. */
export const statusLabel = (status: Donation["status"]): string =>
  status === "completed" ? "مكتمل" : "بانتظار الدفع";
