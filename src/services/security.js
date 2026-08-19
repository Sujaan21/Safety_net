// SafetyNet Security & Sanitization Utilities
export const security = {
  /**
   * Escape unsafe HTML characters to prevent XSS injection.
   */
  escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Sanitize text input: strips control characters and trims.
   */
  sanitizeInput(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, maxLength);
  },

  /**
   * Validate standard phone numbers (international or local).
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    return /^\+?[0-9]{7,15}$/.test(cleaned);
  },

  /**
   * Validate 4-6 digit numeric security PIN.
   */
  isValidPin(pin) {
    return typeof pin === 'string' && /^[0-9]{4,6}$/.test(pin.trim());
  },

  /**
   * Constant-time string equality check to prevent timing attacks.
   */
  constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
};
