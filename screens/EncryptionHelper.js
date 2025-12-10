import CryptoJS from 'crypto-js';
const KEY = "Abis2025Encrypt";
const prepareKey = () => {
  const keyUtf8 = CryptoJS.enc.Utf8.parse(KEY);
  const keyBytes = [];
  
  for (let i = 0; i < keyUtf8.sigBytes; i++) {
    keyBytes.push((keyUtf8.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
  }
  
  while (keyBytes.length < 32) {
    keyBytes.push(0);
  }
  
  const finalKeyBytes = keyBytes.slice(0, 32);
  
  const words = [];
  for (let i = 0; i < finalKeyBytes.length; i += 4) {
    words.push(
      (finalKeyBytes[i] << 24) |
      (finalKeyBytes[i + 1] << 16) |
      (finalKeyBytes[i + 2] << 8) |
      finalKeyBytes[i + 3]
    );
  }
  
  return CryptoJS.lib.WordArray.create(words, 32);
};

const makeUrlUnsafe = (urlSafeBase64) => {
  let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padding);
  return base64;
};

const makeUrlSafe = (base64) => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const isValidEncryptedString = (str) => {
  if (!str || typeof str !== 'string') return false;
  const urlSafeBase64Regex = /^[A-Za-z0-9_-]+$/;
  if (!urlSafeBase64Regex.test(str)) return false;
  if (str.length < 24) return false;
  
  return true;
};

export const decrypt = (cipherText) => {
  if (!cipherText || typeof cipherText !== 'string' || cipherText.trim() === '') {
    throw new Error('Cipher text is empty or invalid');
  }

  const trimmedCipher = cipherText.trim();
  if (!isValidEncryptedString(trimmedCipher)) {
    throw new Error('Invalid encrypted string format');
  }
  try {
    const regularBase64 = makeUrlUnsafe(trimmedCipher);
    
    const fullCipherBytes = CryptoJS.enc.Base64.parse(regularBase64);
    
    if (fullCipherBytes.sigBytes < 16) {
      throw new Error('Encrypted data is corrupted or too short');
    }
    
    const ivWords = fullCipherBytes.words.slice(0, 4);
    const iv = CryptoJS.lib.WordArray.create(ivWords, 16);
  
    const cipherWords = fullCipherBytes.words.slice(4);
    const cipherDataLength = fullCipherBytes.sigBytes - 16;
    const cipherData = CryptoJS.lib.WordArray.create(cipherWords, cipherDataLength);
    
    const key = prepareKey();

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: cipherData },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText || decryptedText.trim() === '') {
      throw new Error('Decryption failed - wrong key or corrupted data');
    }
    return decryptedText;
    
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

export const encrypt = (plainText) => {
  if (!plainText || plainText.trim() === '') {  
    throw new Error('Plain text cannot be null or empty');
  }
  try {
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = prepareKey();
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  
    const ivAndCipher = iv.clone().concat(encrypted.ciphertext);
    const base64 = ivAndCipher.toString(CryptoJS.enc.Base64);
    
    return makeUrlSafe(base64);
    
  } catch (error) {
    throw error;
  }
};
export const testEncryption = (testString = 'test123') => {
  try {
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);
    const isValid = testString === decrypted;
    return isValid;
  } catch (error) {
    return false;
  }
};
export const safeDecrypt = (cipherText) => {
  try {
    return decrypt(cipherText);
  } catch (error) {
    return null;
  }
};