/**
 * @fileoverview Discotive Roadmap — Input Sanitiser
 *
 * NOTE: React already escapes all text-node content, so pure XSS via JSX
 * is not possible. This sanitiser protects against data stored in Firestore
 * that might later be rendered as HTML (e.g. PDF export, email templates).
 * We make NO false claims about being "DOMPurify-equivalent" — it isn't.
 * For user-generated HTML rendering, use DOMPurify as a direct dependency.
 */
export const sanitize = (raw = "", maxLen = 2000) =>
  String(raw)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .slice(0, maxLen)
    .trim();
