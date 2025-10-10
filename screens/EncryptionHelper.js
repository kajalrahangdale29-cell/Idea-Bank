import CryptoJS from 'crypto-js';

const KEY = "Abis2025Encrypt";

// Prepare key to exactly 32 bytes (256-bit) for AES-256
const prepareKey = () => {
  const keyUtf8 = CryptoJS.enc.Utf8.parse(KEY);
  const keyBytes = [];
  
  // Extract bytes from WordArray
  for (let i = 0; i < keyUtf8.sigBytes; i++) {
    keyBytes.push((keyUtf8.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
  }
  
  // Pad to 32 bytes
  while (keyBytes.length < 32) {
    keyBytes.push(0);
  }
  
  // Truncate if longer
  const finalKeyBytes = keyBytes.slice(0, 32);
  
  // Create WordArray from bytes
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

// Convert URL-safe Base64 back to regular Base64
const makeUrlUnsafe = (urlSafeBase64) => {
  let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padding);
  
  return base64;
};

// Convert regular Base64 to URL-safe Base64
const makeUrlSafe = (base64) => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Decrypt function
export const decrypt = (cipherText) => {
  if (!cipherText || cipherText.trim() === '') {
    console.error('decrypt: Cipher text is empty');
    return '';
  }

  try {
    console.log('decrypt: Input cipher text:', cipherText);
    
    // Convert from URL-safe Base64 to regular Base64
    const regularBase64 = makeUrlUnsafe(cipherText);
    console.log('decrypt: Regular Base64:', regularBase64);
    
    // Decode Base64 to bytes
    const fullCipherBytes = CryptoJS.enc.Base64.parse(regularBase64);
    console.log('decrypt: Full cipher bytes length:', fullCipherBytes.sigBytes);
    
    if (fullCipherBytes.sigBytes < 16) {
      console.error('decrypt: Cipher text too short');
      return '';
    }
    
    // Extract IV (first 16 bytes)
    const ivWords = fullCipherBytes.words.slice(0, 4);
    const iv = CryptoJS.lib.WordArray.create(ivWords, 16);
    
    // Extract encrypted data (remaining bytes)
    const cipherWords = fullCipherBytes.words.slice(4);
    const cipherDataLength = fullCipherBytes.sigBytes - 16;
    const cipherData = CryptoJS.lib.WordArray.create(cipherWords, cipherDataLength);
    
    console.log('decrypt: IV length:', iv.sigBytes);
    console.log('decrypt: Cipher data length:', cipherData.sigBytes);
    
    // Prepare key
    const key = prepareKey();
    
    // Decrypt
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
    console.log('decrypt: Decrypted text:', decryptedText);
    
    return decryptedText;
    
  } catch (error) {
    console.error('decrypt: Error -', error.message);
    console.error('decrypt: Stack -', error.stack);
    return '';
  }
};

export const encrypt = (plainText) => {
  if (!plainText || plainText.trim() === '') {
    throw new Error('Plain text cannot be null or empty');
  }

  try {
    // Generate random IV (16 bytes)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // Prepare key
    const key = prepareKey();
    
    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Combine IV + encrypted data
    const ivAndCipher = iv.clone().concat(encrypted.ciphertext);
    
    // Convert to Base64
    const base64 = ivAndCipher.toString(CryptoJS.enc.Base64);
    
    // Convert to URL-safe Base64
    return makeUrlSafe(base64);
    
  } catch (error) {
    console.error('encrypt: Error -', error);
    throw error;
  }
};

export const testEncryption = (testString = 'test123') => {
  try {
    console.log('=== ENCRYPTION TEST START ===');
    console.log('Test String:', testString);
    
    const encrypted = encrypt(testString);
    console.log('Encrypted:', encrypted);
    
    const decrypted = decrypt(encrypted);
    console.log('Decrypted:', decrypted);
    
    const passed = testString === decrypted;
    console.log('Test Passed:', passed);
    console.log('=== ENCRYPTION TEST END ===');
    
    return passed;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};