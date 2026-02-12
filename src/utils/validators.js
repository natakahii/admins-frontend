/**
 * validator.jsx
 * - Small, reusable validators for forms
 * - Keep frontend consistent with backend validation rules
 */

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function minLength(value, min) {
  return String(value || "").trim().length >= min;
}

export function maxLength(value, max) {
  return String(value || "").trim().length <= max;
}

export function isEmail(value) {
  const v = String(value || "").trim();
  // simple and practical email pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * Accept:
 * - Email
 * - Phone in E.164 (+2557xxxxxxx)
 * - Phone local TZ: 07xxxxxxxx / 06xxxxxxxx (common)
 */
export function isEmailOrPhone(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  if (isEmail(v)) return true;

  // E.164 basic
  if (/^\+\d{10,15}$/.test(v)) return true;

  // Tanzania common local mobile patterns (06/07 + 8 digits)
  if (/^(0)(6|7)\d{8}$/.test(v)) return true;

  return false;
}

export function normalizeEmailOrPhone(value) {
  const v = String(value || "").trim();

  // If local TZ number 07xxxxxxxx -> +2557xxxxxxx
  if (/^(0)(6|7)\d{8}$/.test(v)) {
    return `+255${v.substring(1)}`;
  }
  return v;
}

export function validateLogin({ email_or_phone, password }) {
  const errors = {};

  if (!isRequired(email_or_phone)) {
    errors.email_or_phone = "Email or phone is required.";
  } else if (!isEmailOrPhone(email_or_phone)) {
    errors.email_or_phone = "Enter a valid email or phone number.";
  }

  if (!isRequired(password)) {
    errors.password = "Password is required.";
  } else if (!minLength(password, 6)) {
    errors.password = "Password must be at least 8 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
