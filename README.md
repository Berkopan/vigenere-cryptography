# CipherScope — Vigenère & Kasiski Lab

An interactive, dependency-free visual lab for learning how the **Vigenère cipher** works and why a repeating key can be exposed with a **Kasiski examination**.

The goal is not just to show the final ciphertext. The interface slows the algorithms down and makes every important intermediate state visible.

## What the lab visualizes

### 1. Vigenère encryption

- Plaintext and repeating-key alignment
- A–Z → 0–25 numeric mapping
- Per-letter shift arithmetic: `Cᵢ = (Pᵢ + Kᵢ) mod 26`
- Live shifted alphabet mapping
- Play / pause / previous / next controls
- Adjustable animation speed
- A scrolling letter timeline showing plaintext, key, shift and ciphertext together

### 2. Kasiski attack

The attack is presented in five animated phases:

1. **Find repeated n-grams** in the ciphertext.
2. **Measure the distances** between repeated fragments.
3. **Factor those distances** to estimate likely key lengths.
4. **Split the ciphertext into Caesar columns** and use English frequency analysis to recover each shift.
5. **Reconstruct the key and decrypt** the ciphertext.

> Kasiski examination itself estimates the **key period**; it does not directly reveal the whole key. This lab deliberately shows the follow-up frequency-analysis step rather than hiding that distinction.

## Run locally

No dependencies are required.

```bash
npm test
npm run serve
```

Then open `http://localhost:5173`.

You can also use any static HTTP server because the project is plain HTML, CSS and ES modules.

## Tests

The algorithm layer is covered with Node's built-in test runner. Tests include:

- The canonical `ATTACKATDAWN / LEMON → LXFOPVEFRNHR` example
- Encryption/decryption round trips with punctuation
- Repeated n-gram detection
- Frequency-analysis key recovery
- The full prepared Kasiski demo, where the key `ORCHARD` is recovered from ciphertext

```bash
npm test
```

## Deploy on GitHub Pages

Because there is no build step, GitHub Pages can serve the repository root directly:

1. Open **Settings → Pages** in the repository.
2. Choose **Deploy from a branch**.
3. Select `main` and `/ (root)`.

## Project structure

```text
.
├── index.html
├── styles.css
├── favicon.svg
├── src/
│   ├── app.js       # UI state, animation and rendering
│   └── crypto.js    # Vigenère + Kasiski/frequency algorithms
└── tests/
    └── crypto.test.mjs
```

## Educational note

Vigenère is a classical cipher and is **not secure for modern data**. The weaknesses visualized here are exactly why repeating-key classical ciphers should only be used for learning.
