// SafetyNet Zero-Knowledge Cryptographic Vault
// Uses native Web Crypto API (AES-256-GCM + PBKDF2-SHA256)

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const vaultCrypto = {
  // Session-held encryption key (cleared on auto-lock or manual lock)
  _sessionKey: null,
  _isUnlocked: false,
  _isDuressMode: false,

  isUnlocked() {
    return this._isUnlocked;
  },

  isDuressMode() {
    return this._isDuressMode;
  },

  lock() {
    this._sessionKey = null;
    this._isUnlocked = false;
    this._isDuressMode = false;
    window.dispatchEvent(new CustomEvent('safetynet:vault-locked'));
  },

  /**
   * Derive AES-GCM CryptoKey from string PIN and random salt using PBKDF2
   */
  async deriveKey(pin, saltBuffer) {
    const enc = new TextEncoder();
    const pinBuffer = enc.encode(pin);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      pinBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Encrypt an object or string with AES-256-GCM
   */
  async encrypt(data, pin) {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
      const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTES));
      const key = await this.deriveKey(pin, salt);

      const enc = new TextEncoder();
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      const encoded = enc.encode(plaintext);

      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoded
      );

      return {
        v: 1, // Version 1 format
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv),
        data: bufferToBase64(ciphertext)
      };
    } catch (err) {
      console.error('Encryption failed:', err);
      throw new Error('Encryption operation failed');
    }
  },

  /**
   * Decrypt payload with AES-256-GCM
   */
  async decrypt(payload, pin) {
    try {
      if (!payload || !payload.salt || !payload.iv || !payload.data) {
        throw new Error('Invalid encrypted payload structure');
      }

      const salt = new Uint8Array(base64ToBuffer(payload.salt));
      const iv = new Uint8Array(base64ToBuffer(payload.iv));
      const ciphertext = base64ToBuffer(payload.data);

      const key = await this.deriveKey(pin, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      const plaintext = dec.decode(decrypted);

      try {
        return JSON.parse(plaintext);
      } catch {
        return plaintext;
      }
    } catch (err) {
      console.warn('Decryption authentication check failed (incorrect PIN or tampered data)');
      throw new Error('INVALID_PIN');
    }
  },

  /**
   * Unlock the vault with the given PIN against stored metadata
   */
  async unlock(pin, vaultMeta, duressPin = null) {
    if (duressPin && pin === duressPin) {
      this._isDuressMode = true;
      this._isUnlocked = true;
      window.dispatchEvent(new CustomEvent('safetynet:duress-triggered'));
      return { success: true, duress: true };
    }

    try {
      const decrypted = await this.decrypt(vaultMeta.verifier, pin);
      if (decrypted && decrypted.check === 'SAFETYNET_VAULT_OK') {
        this._sessionKey = pin;
        this._isUnlocked = true;
        this._isDuressMode = false;
        window.dispatchEvent(new CustomEvent('safetynet:vault-unlocked'));
        return { success: true, duress: false };
      }
      return { success: false, error: 'INVALID_PIN' };
    } catch {
      return { success: false, error: 'INVALID_PIN' };
    }
  },

  /**
   * Create verifier token for new PIN setup
   */
  async createVerifier(pin) {
    return this.encrypt({ check: 'SAFETYNET_VAULT_OK', created: Date.now() }, pin);
  }
};
