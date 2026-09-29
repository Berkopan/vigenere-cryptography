import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeKasiskiAttack,
  decryptVigenere,
  encryptVigenere,
  findRepeatedNgrams,
  inferKeyByFrequency,
  normalizeLetters,
} from '../src/crypto.js';

const attackPlaintext = `Cryptography becomes easier to understand when every transformation is visible. In this lab each plaintext letter is paired with a letter from a repeating key, converted to a number, shifted through the alphabet, and turned into ciphertext. The animation slows that process down so the arithmetic and the pattern can be inspected rather than memorized.

Repeated patterns reveal the secret key length in a cipher.

A polyalphabetic cipher tries to hide ordinary letter frequencies by changing the Caesar shift as the key advances. That makes simple frequency analysis less useful on the complete message. However, language contains repeated words and fragments. When the same fragment appears again under the same key alignment, the encrypted fragment also repeats. An analyst can measure the distance between those repetitions and factor the distances. Common factors suggest the period of the repeating key.

Repeated patterns reveal the secret key length in a cipher.

Once a plausible period is known, the ciphertext can be split into columns. Each column was encrypted with only one Caesar shift, so ordinary frequency analysis becomes useful again. The lab compares every possible shift against typical English frequencies, chooses the best fit for each column, reconstructs a candidate key, and finally decrypts the message. This is why a long repeating key is stronger than a short one, and why modern cryptography avoids this design entirely.`;

test('encrypts the canonical Vigenere example', () => {
  const result = encryptVigenere('ATTACKATDAWN', 'LEMON');
  assert.equal(result.output, 'LXFOPVEFRNHR');
});

test('decrypts while preserving punctuation and spacing', () => {
  const encrypted = encryptVigenere('Attack at dawn!', 'LEMON').output;
  const decrypted = decryptVigenere(encrypted, 'LEMON').output;
  assert.equal(decrypted, 'ATTACK AT DAWN!');
});

test('finds repeated ciphertext n-grams in the attack demo', () => {
  const ciphertext = encryptVigenere(attackPlaintext, 'ORCHARD').output;
  const repeats = findRepeatedNgrams(ciphertext);
  assert.ok(repeats.length > 0);
});

test('frequency analysis recovers the demo key once its length is known', () => {
  const ciphertext = encryptVigenere(attackPlaintext, 'ORCHARD').output;
  assert.equal(inferKeyByFrequency(ciphertext, 7).key, 'ORCHARD');
});

test('the full Kasiski demo ranks seven as the strongest factor and decrypts the text', () => {
  const ciphertext = encryptVigenere(attackPlaintext, 'ORCHARD').output;
  const analysis = analyzeKasiskiAttack(ciphertext, { maxKeyLength: 16 });
  assert.equal(analysis.selectedLength, 7);
  assert.equal(analysis.frequency.key, 'ORCHARD');
  assert.equal(normalizeLetters(analysis.plaintext), normalizeLetters(attackPlaintext));
});
