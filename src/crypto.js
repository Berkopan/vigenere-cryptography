export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ENGLISH_FREQUENCIES = [
  0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015,
  0.06094, 0.06966, 0.00153, 0.00772, 0.04025, 0.02406, 0.06749,
  0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758,
  0.00978, 0.02360, 0.00150, 0.01974, 0.00074,
];

export function normalizeLetters(value) {
  return (value ?? '').toUpperCase().replace(/[^A-Z]/g, '');
}

export function sanitizeKey(key) {
  return normalizeLetters(key);
}

function charToIndex(char) {
  return char.charCodeAt(0) - 65;
}

function indexToChar(index) {
  return ALPHABET[(index + 26) % 26];
}

export function vigenereTransform(text, key, direction = 1) {
  const cleanKey = sanitizeKey(key);
  if (!cleanKey) {
    return { output: text ?? '', details: [], key: '' };
  }

  let letterIndex = 0;
  let output = '';
  const details = [];

  [...(text ?? '')].forEach((rawChar, sourceIndex) => {
    const char = rawChar.toUpperCase();
    if (!/[A-Z]/.test(char)) {
      output += rawChar;
      return;
    }

    const keyChar = cleanKey[letterIndex % cleanKey.length];
    const inputValue = charToIndex(char);
    const keyValue = charToIndex(keyChar);
    const outputValue = (inputValue + direction * keyValue + 26) % 26;
    const outputChar = indexToChar(outputValue);

    details.push({
      sourceIndex,
      letterIndex,
      inputChar: char,
      keyChar,
      inputValue,
      keyValue,
      outputValue,
      outputChar,
    });

    output += outputChar;
    letterIndex += 1;
  });

  return { output, details, key: cleanKey };
}

export function encryptVigenere(text, key) {
  return vigenereTransform(text, key, 1);
}

export function decryptVigenere(text, key) {
  return vigenereTransform(text, key, -1);
}

export function findRepeatedNgrams(ciphertext, options = {}) {
  const {
    minLength = 3,
    maxLength = 5,
    maxResults = 40,
  } = options;
  const text = normalizeLetters(ciphertext);
  const repeats = [];

  for (let length = maxLength; length >= minLength; length -= 1) {
    const positionsByGram = new Map();

    for (let index = 0; index <= text.length - length; index += 1) {
      const gram = text.slice(index, index + length);
      if (!positionsByGram.has(gram)) positionsByGram.set(gram, []);
      positionsByGram.get(gram).push(index);
    }

    for (const [gram, positions] of positionsByGram.entries()) {
      if (positions.length < 2) continue;
      const distances = [];
      for (let index = 1; index < positions.length; index += 1) {
        distances.push(positions[index] - positions[index - 1]);
      }
      repeats.push({ gram, length, positions, distances });
    }
  }

  repeats.sort((a, b) => {
    const evidenceA = a.length * (a.positions.length - 1);
    const evidenceB = b.length * (b.positions.length - 1);
    return evidenceB - evidenceA || b.length - a.length || a.gram.localeCompare(b.gram);
  });

  return repeats.slice(0, maxResults);
}

export function scoreKasiskiFactors(repeats, maxKeyLength = 16) {
  const scores = Array.from({ length: Math.max(0, maxKeyLength - 1) }, (_, offset) => ({
    factor: offset + 2,
    score: 0,
    hits: 0,
  }));

  const byFactor = new Map(scores.map((entry) => [entry.factor, entry]));

  for (const repeat of repeats) {
    for (const distance of repeat.distances) {
      for (let factor = 2; factor <= maxKeyLength; factor += 1) {
        if (distance % factor !== 0) continue;
        const entry = byFactor.get(factor);
        entry.score += repeat.length;
        entry.hits += 1;
      }
    }
  }

  return scores.sort((a, b) => b.score - a.score || b.hits - a.hits || a.factor - b.factor);
}

export function indexOfCoincidence(text) {
  const clean = normalizeLetters(text);
  const n = clean.length;
  if (n < 2) return 0;

  const counts = Array(26).fill(0);
  for (const char of clean) counts[charToIndex(char)] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (n * (n - 1));
}

export function averageColumnIC(ciphertext, keyLength) {
  const clean = normalizeLetters(ciphertext);
  if (!clean || !Number.isInteger(keyLength) || keyLength < 1) return 0;

  let total = 0;
  for (let column = 0; column < keyLength; column += 1) {
    let columnText = '';
    for (let index = column; index < clean.length; index += keyLength) {
      columnText += clean[index];
    }
    total += indexOfCoincidence(columnText);
  }
  return total / keyLength;
}

export function getKasiskiCandidates(ciphertext, options = {}) {
  const maxKeyLength = options.maxKeyLength ?? 16;
  const repeats = findRepeatedNgrams(ciphertext, options);
  const factorScores = scoreKasiskiFactors(repeats, maxKeyLength);
  const maxScore = factorScores[0]?.score ?? 0;

  const candidates = factorScores
    .filter((entry) => entry.score > 0)
    .map((entry) => ({
      ...entry,
      normalizedScore: maxScore ? entry.score / maxScore : 0,
      ic: averageColumnIC(ciphertext, entry.factor),
    }));

  return { repeats, candidates };
}

function chiSquaredForShift(columnText, shift) {
  const clean = normalizeLetters(columnText);
  const n = clean.length;
  if (!n) return Number.POSITIVE_INFINITY;

  const observed = Array(26).fill(0);
  for (const char of clean) observed[charToIndex(char)] += 1;

  let score = 0;
  for (let cipherIndex = 0; cipherIndex < 26; cipherIndex += 1) {
    const plainIndex = (cipherIndex - shift + 26) % 26;
    const expected = ENGLISH_FREQUENCIES[plainIndex] * n;
    if (expected > 0) {
      score += ((observed[cipherIndex] - expected) ** 2) / expected;
    }
  }
  return score;
}

export function inferKeyByFrequency(ciphertext, keyLength) {
  const clean = normalizeLetters(ciphertext);
  if (!clean || !Number.isInteger(keyLength) || keyLength < 1) {
    return { key: '', columns: [] };
  }

  const columns = [];
  let key = '';

  for (let columnIndex = 0; columnIndex < keyLength; columnIndex += 1) {
    let columnText = '';
    for (let index = columnIndex; index < clean.length; index += keyLength) {
      columnText += clean[index];
    }

    const attempts = Array.from({ length: 26 }, (_, shift) => ({
      shift,
      keyChar: indexToChar(shift),
      chiSquared: chiSquaredForShift(columnText, shift),
    })).sort((a, b) => a.chiSquared - b.chiSquared);

    const best = attempts[0];
    key += best.keyChar;
    columns.push({
      columnIndex,
      columnText,
      best,
      runnerUp: attempts[1],
      attempts,
    });
  }

  return { key, columns };
}

export function analyzeKasiskiAttack(ciphertext, options = {}) {
  const { repeats, candidates } = getKasiskiCandidates(ciphertext, options);
  const selectedLength = candidates[0]?.factor ?? 0;
  const frequency = selectedLength
    ? inferKeyByFrequency(ciphertext, selectedLength)
    : { key: '', columns: [] };
  const plaintext = frequency.key
    ? decryptVigenere(ciphertext, frequency.key).output
    : '';

  return {
    repeats,
    candidates,
    selectedLength,
    frequency,
    plaintext,
  };
}
