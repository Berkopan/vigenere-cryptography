import {
  ALPHABET,
  analyzeKasiskiAttack,
  decryptVigenere,
  encryptVigenere,
  inferKeyByFrequency,
  normalizeLetters,
} from './crypto.js';
import {
  applyStaticTranslations,
  getAttackPhases,
  getLanguage,
  setLanguage,
  t,
} from './i18n.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const ATTACK_DEMO_PLAINTEXT = `Cryptography becomes easier to understand when every transformation is visible. In this lab each plaintext letter is paired with a letter from a repeating key, converted to a number, shifted through the alphabet, and turned into ciphertext. The animation slows that process down so the arithmetic and the pattern can be inspected rather than memorized.

Repeated patterns reveal the secret key length in a cipher.

A polyalphabetic cipher tries to hide ordinary letter frequencies by changing the Caesar shift as the key advances. That makes simple frequency analysis less useful on the complete message. However, language contains repeated words and fragments. When the same fragment appears again under the same key alignment, the encrypted fragment also repeats. An analyst can measure the distance between those repetitions and factor the distances. Common factors suggest the period of the repeating key.

Repeated patterns reveal the secret key length in a cipher.

Once a plausible period is known, the ciphertext can be split into columns. Each column was encrypted with only one Caesar shift, so ordinary frequency analysis becomes useful again. The lab compares every possible shift against typical English frequencies, chooses the best fit for each column, reconstructs a candidate key, and finally decrypts the message. This is why a long repeating key is stronger than a short one, and why modern cryptography avoids this design entirely.`;
const ATTACK_DEMO_KEY = 'ORCHARD';
const ATTACK_DEMO_CIPHERTEXT = encryptVigenere(ATTACK_DEMO_PLAINTEXT, ATTACK_DEMO_KEY).output;

const state = {
  cipher: {
    result: encryptVigenere($('#plaintext').value, $('#key').value),
    index: -1,
    playing: false,
    timer: null,
  },
  attack: {
    analysis: null,
    phase: 0,
    playing: false,
    timer: null,
    selectedLength: 0,
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function switchTab(name, shouldScroll = false) {
  $$('.lab-tab').forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  $$('.lab-panel').forEach((panel) => {
    const active = panel.dataset.panel === name;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
  if (shouldScroll) $('#lab').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stopCipherPlayback() {
  state.cipher.playing = false;
  clearTimeout(state.cipher.timer);
  state.cipher.timer = null;
  $('#playCipher').textContent = '▶';
  $('#playCipher').setAttribute('aria-label', t('playEncryption'));
}

function scheduleCipherStep() {
  if (!state.cipher.playing) return;
  const total = state.cipher.result.details.length;
  if (!total || state.cipher.index >= total - 1) {
    stopCipherPlayback();
    return;
  }

  state.cipher.timer = setTimeout(() => {
    state.cipher.index += 1;
    renderCipherVisualizer();
    scheduleCipherStep();
  }, Number($('#cipherSpeed').value));
}

function toggleCipherPlayback() {
  if (!state.cipher.result.details.length) return;
  if (state.cipher.playing) {
    stopCipherPlayback();
    return;
  }
  if (state.cipher.index >= state.cipher.result.details.length - 1) state.cipher.index = -1;
  state.cipher.playing = true;
  $('#playCipher').textContent = 'Ⅱ';
  $('#playCipher').setAttribute('aria-label', t('pauseEncryption'));
  if (state.cipher.index < 0) {
    state.cipher.index = 0;
    renderCipherVisualizer();
  }
  scheduleCipherStep();
}

function buildCipher() {
  stopCipherPlayback();
  const key = $('#key').value;
  const cleanKey = normalizeLetters(key);
  if (!cleanKey) {
    $('#key').focus();
    $('#key').setCustomValidity(t('keyValidation'));
    $('#key').reportValidity();
    return;
  }
  $('#key').setCustomValidity('');
  $('#key').value = cleanKey;
  state.cipher.result = encryptVigenere($('#plaintext').value, cleanKey);
  state.cipher.index = -1;
  renderCipherVisualizer();
}

function renderAlphabets(detail) {
  const shift = detail?.keyValue ?? 0;
  const shifted = [...ALPHABET].map((_, index) => ALPHABET[(index + shift) % 26]).join('');
  $('#plainAlphabet').innerHTML = [...ALPHABET].map((char, index) =>
    `<span class="${detail && index === detail.inputValue ? 'active' : ''}">${char}</span>`
  ).join('');
  $('#shiftedAlphabet').innerHTML = [...shifted].map((char, index) =>
    `<span class="${detail && index === detail.inputValue ? 'active' : ''}">${char}</span>`
  ).join('');
}

function renderTimeline() {
  const details = state.cipher.result.details;
  const active = state.cipher.index;
  const windowSize = Math.min(28, details.length);
  const maxStart = Math.max(0, details.length - windowSize);
  const start = clamp(active < 0 ? 0 : active - 8, 0, maxStart);
  const visible = details.slice(start, start + windowSize);
  const [plainLabel, keyLabel, shiftLabel, cipherLabel] = t('timelineLabels');
  const rows = [
    [plainLabel, 'plain', (item) => item.inputChar],
    [keyLabel, 'key', (item) => item.keyChar],
    [shiftLabel, 'shift', (item) => item.keyValue],
    [cipherLabel, 'cipher', (item) => item.outputChar],
  ];

  $('#timelineGrid').innerHTML = rows.map(([label, className, value]) => `
    <div class="timeline-row ${className}" style="--cells:${visible.length}">
      <span class="timeline-row-label">${label}</span>
      ${visible.map((item) => {
        const classes = [
          'timeline-cell',
          item.letterIndex < active ? 'past' : '',
          item.letterIndex === active ? 'active' : '',
        ].filter(Boolean).join(' ');
        return `<span class="${classes}">${value(item)}</span>`;
      }).join('')}
    </div>
  `).join('');

  $('#timelineWindow').textContent = visible.length
    ? t('timelineWindow', { start: start + 1, end: start + visible.length, total: details.length })
    : t('noLetters');
}

function renderCipherVisualizer() {
  const details = state.cipher.result.details;
  const active = details[state.cipher.index] ?? null;
  $('#cipherOutput').textContent = state.cipher.result.output || '—';
  $('#stepCounter').textContent = `${Math.max(0, state.cipher.index + 1)} / ${details.length}`;

  if (!active) {
    $('#stepCopy').innerHTML = `
      <span class="step-badge">${t('ready')}</span>
      <h3>${t('pressPlay')}</h3>
      <p>${t('pressPlayBody')}</p>
    `;
    $('#formulaCard').innerHTML = '<span>—</span><b>+</b><span>—</span><b>mod 26</b><strong>= —</strong>';
  } else {
    $('#stepCopy').innerHTML = `
      <span class="step-badge">${t('letter')} ${active.letterIndex + 1}</span>
      <h3>${t('shiftsBy', { input: active.inputChar, shift: active.keyValue, key: active.keyChar })}</h3>
      <p>${t('mapping', { input: active.inputChar, inputValue: active.inputValue, key: active.keyChar, keyValue: active.keyValue, output: active.outputChar })}</p>
    `;
    $('#formulaCard').innerHTML = `
      <span>${active.inputValue}</span><b>+</b><span>${active.keyValue}</span><b>mod 26</b><strong>= ${active.outputValue} · ${active.outputChar}</strong>
    `;
  }

  renderAlphabets(active);
  renderTimeline();
}

function stepCipher(direction) {
  stopCipherPlayback();
  const last = state.cipher.result.details.length - 1;
  state.cipher.index = clamp(state.cipher.index + direction, -1, last);
  renderCipherVisualizer();
}

function resetCipher() {
  stopCipherPlayback();
  state.cipher.index = -1;
  renderCipherVisualizer();
}

function loadAttackDemo(run = false) {
  $('#attackCiphertext').value = ATTACK_DEMO_CIPHERTEXT;
  updateAttackLetterCount();
  $('#attackNotice').hidden = true;
  if (run) analyzeAttack();
}

function updateAttackLetterCount() {
  $('#attackLetterCount').textContent = normalizeLetters($('#attackCiphertext').value).length.toLocaleString();
}

function stopAttackPlayback() {
  state.attack.playing = false;
  clearTimeout(state.attack.timer);
  state.attack.timer = null;
  $('#playAttack').textContent = '▶';
  $('#playAttack').setAttribute('aria-label', t('playAttack'));
}

function scheduleAttackPhase() {
  if (!state.attack.playing) return;
  if (state.attack.phase >= getAttackPhases().length - 1) {
    stopAttackPlayback();
    return;
  }
  state.attack.timer = setTimeout(() => {
    state.attack.phase += 1;
    renderAttack();
    scheduleAttackPhase();
  }, Number($('#attackSpeed').value));
}

function toggleAttackPlayback() {
  if (!state.attack.analysis) return;
  if (state.attack.playing) {
    stopAttackPlayback();
    return;
  }
  if (state.attack.phase >= getAttackPhases().length - 1) state.attack.phase = 0;
  state.attack.playing = true;
  $('#playAttack').textContent = 'Ⅱ';
  $('#playAttack').setAttribute('aria-label', t('pauseAttack'));
  renderAttack();
  scheduleAttackPhase();
}

function stepAttack(direction) {
  if (!state.attack.analysis) return;
  stopAttackPlayback();
  state.attack.phase = clamp(state.attack.phase + direction, 0, getAttackPhases().length - 1);
  renderAttack();
}

function analyzeAttack() {
  stopAttackPlayback();
  const ciphertext = $('#attackCiphertext').value;
  const clean = normalizeLetters(ciphertext);
  const maxKeyLength = Number($('#maxKeyLength').value);
  const notice = $('#attackNotice');

  if (clean.length < 40) {
    notice.hidden = false;
    notice.textContent = t('shortCipherWarning');
  } else {
    notice.hidden = true;
  }

  const initial = analyzeKasiskiAttack(ciphertext, { maxKeyLength });
  state.attack.analysis = initial;
  state.attack.phase = 0;
  state.attack.selectedLength = initial.selectedLength;

  if (!initial.repeats.length || !initial.selectedLength) {
    notice.hidden = false;
    notice.textContent = t('noRepeatsWarning');
  }

  renderAttack();
}

function getSelectedAttackData() {
  const analysis = state.attack.analysis;
  if (!analysis) return null;
  const length = state.attack.selectedLength || analysis.selectedLength;
  if (!length) return { ...analysis, selectedLength: 0, frequency: { key: '', columns: [] }, plaintext: '' };
  const frequency = inferKeyByFrequency($('#attackCiphertext').value, length);
  const plaintext = frequency.key ? decryptVigenere($('#attackCiphertext').value, frequency.key).output : '';
  return { ...analysis, selectedLength: length, frequency, plaintext };
}

function renderAttackProgress() {
  const attackPhases = getAttackPhases();
  $('#attackProgress').innerHTML = attackPhases.map((phase, index) => {
    const classes = [
      'progress-step',
      index < state.attack.phase ? 'done' : '',
      index === state.attack.phase ? 'active' : '',
    ].filter(Boolean).join(' ');
    return `<div class="${classes}"><i></i><span>${phase.short}</span></div>`;
  }).join('');
}

function phaseHeader(index, eyebrow, title, description) {
  return `
    <div class="phase-header">
      <div>
        <span class="section-kicker">${eyebrow}</span>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <span class="phase-index">0${index + 1} / 05</span>
    </div>
  `;
}

function chooseIllustrativeRepeat(repeats, selectedLength) {
  if (!repeats.length) return null;
  const withUsefulDistance = repeats.filter((repeat) =>
    repeat.distances.some((distance) => selectedLength && distance % selectedLength === 0)
  );
  const pool = withUsefulDistance.length ? withUsefulDistance : repeats;
  return [...pool].sort((a, b) => {
    const aMax = Math.max(...a.positions);
    const bMax = Math.max(...b.positions);
    const aVisible = aMax < 900 ? 1 : 0;
    const bVisible = bMax < 900 ? 1 : 0;
    return bVisible - aVisible || b.length - a.length || aMax - bMax;
  })[0];
}

function renderRepeatPhase(data) {
  const text = normalizeLetters($('#attackCiphertext').value);
  const repeat = chooseIllustrativeRepeat(data.repeats, data.selectedLength);
  const marks = new Map();
  if (repeat) {
    repeat.positions.slice(0, 4).forEach((position, occurrenceIndex) => {
      for (let offset = 0; offset < repeat.length; offset += 1) {
        marks.set(position + offset, occurrenceIndex % 2 ? 'secondary-mark' : 'marked');
      }
    });
  }
  const limit = Math.min(text.length, 900);
  const stream = [...text.slice(0, limit)].map((char, index) => `<span class="cipher-char ${marks.get(index) ?? ''}">${char}</span>`).join('');
  return `
    ${phaseHeader(0, t('phase1Eyebrow'), t('phase1Title'), t('phase1Body'))}
    <div class="cipher-stream">${stream}${text.length > limit ? '<span class="cipher-char">…</span>' : ''}</div>
    <div class="evidence-grid">
      <div class="evidence-card"><span>${t('repeatedNgrams')}</span><strong>${data.repeats.length}</strong></div>
      <div class="evidence-card"><span>${t('highlightedExample')}</span><strong>${escapeHTML(repeat?.gram ?? '—')}</strong></div>
      <div class="evidence-card"><span>${t('occurrences')}</span><strong>${repeat?.positions.length ?? 0}</strong></div>
    </div>
  `;
}

function renderDistancePhase(data) {
  const repeats = data.repeats.slice(0, 10);
  return `
    ${phaseHeader(1, t('phase2Eyebrow'), t('phase2Title'), t('phase2Body'))}
    <div class="repeat-list">
      ${repeats.map((repeat) => `
        <div class="repeat-item">
          <span class="gram">${escapeHTML(repeat.gram)}</span>
          <span class="positions">${t('positions')} ${repeat.positions.slice(0, 5).join(', ')}${repeat.positions.length > 5 ? '…' : ''}</span>
          <span class="distance-badges">${repeat.distances.slice(0, 5).map((distance) => `<span>Δ ${distance}</span>`).join('')}</span>
        </div>
      `).join('') || `<div class="empty-state"><div class="empty-state-inner"><h3>${t('noDistancesTitle')}</h3><p>${t('noDistancesBody')}</p></div></div>`}
    </div>
  `;
}

function renderFactorPhase(data) {
  const candidates = data.candidates.slice(0, 10);
  const maxScore = candidates[0]?.score || 1;
  return `
    ${phaseHeader(2, t('phase3Eyebrow'), t('phase3Title'), t('phase3Body'))}
    <div class="factor-layout">
      <div class="factor-chart">
        ${candidates.map((candidate) => `
          <div class="factor-row ${candidate.factor === data.selectedLength ? 'selected' : ''}" data-factor="${candidate.factor}">
            <span class="factor-number">${candidate.factor}</span>
            <div class="factor-track"><div class="factor-fill" style="width:${Math.max(3, candidate.score / maxScore * 100)}%"></div></div>
            <span class="factor-score">${candidate.score}</span>
          </div>
        `).join('') || `<p>${t('noFactorEvidence')}</p>`}
      </div>
      <aside class="candidate-card">
        <span>${t('selectedPeriod')}</span>
        <strong>${data.selectedLength || '—'}</strong>
        <p>${data.selectedLength ? t('selectedPeriodBody', { ic: (data.candidates.find((candidate) => candidate.factor === data.selectedLength)?.ic ?? 0).toFixed(3) }) : t('selectedPeriodEmpty')}</p>
      </aside>
    </div>
  `;
}

function renderColumnPhase(data) {
  const columns = data.frequency.columns;
  return `
    ${phaseHeader(3, t('phase4Eyebrow'), t('phase4Title'), t('phase4Body', { period: data.selectedLength || '—' }))}
    <div class="column-grid">
      ${columns.map((column) => {
        const ratio = column.runnerUp?.chiSquared ? clamp(column.runnerUp.chiSquared / column.best.chiSquared, 1, 4) : 1;
        const confidence = clamp((ratio - 1) / 3, 0.12, 1) * 100;
        return `
          <article class="column-card">
            <header><span>${t('column')} ${column.columnIndex + 1}</span><strong>${column.best.keyChar}</strong></header>
            <div class="column-sample">${escapeHTML(column.columnText.slice(0, 44))}${column.columnText.length > 44 ? '…' : ''}</div>
            <div class="column-confidence" title="${t('confidenceTitle')}"><i style="width:${confidence}%"></i></div>
          </article>
        `;
      }).join('') || `<p>${t('noColumns')}</p>`}
    </div>
    <div class="key-reveal"><span>${t('recoveredKeyCandidate')}</span><strong>${escapeHTML(data.frequency.key || '—')}</strong></div>
  `;
}

function renderDecryptPhase(data) {
  return `
    ${phaseHeader(4, t('phase5Eyebrow'), t('phase5Title'), t('phase5Body'))}
    <div class="plaintext-reveal">${escapeHTML(data.plaintext || t('noPlaintext'))}</div>
    <div class="result-strip">
      <div class="result-stat"><span>${t('keyLength')}</span><strong>${data.selectedLength || '—'}</strong></div>
      <div class="result-stat"><span>${t('recoveredKey')}</span><strong>${escapeHTML(data.frequency.key || '—')}</strong></div>
      <div class="result-stat"><span>${t('resultType')}</span><strong>${data.frequency.key ? t('statisticalCandidate') : t('unavailable')}</strong></div>
    </div>
  `;
}

function renderAttack() {
  renderAttackProgress();
  const stage = $('#attackStage');
  const attackPhases = getAttackPhases();
  $('#attackPhaseLabel').textContent = state.attack.analysis ? attackPhases[state.attack.phase].label : t('readyLabel');

  if (!state.attack.analysis) {
    stage.innerHTML = `
      <div class="empty-state"><div class="empty-state-inner">
        <div class="empty-icon">K</div>
        <h3>${t('emptyAttackTitle')}</h3>
        <p>${t('emptyAttackBody')}</p>
      </div></div>
    `;
    return;
  }

  const data = getSelectedAttackData();
  const renderers = [renderRepeatPhase, renderDistancePhase, renderFactorPhase, renderColumnPhase, renderDecryptPhase];
  stage.innerHTML = renderers[state.attack.phase](data);

  $$('.factor-row', stage).forEach((row) => {
    row.addEventListener('click', () => {
      state.attack.selectedLength = Number(row.dataset.factor);
      renderAttack();
    });
  });
}

function sendCipherToAttack() {
  const ciphertext = state.cipher.result.output;
  if (!ciphertext) return;
  $('#attackCiphertext').value = ciphertext;
  updateAttackLetterCount();
  switchTab('attack', true);
  analyzeAttack();
}

function refreshLanguageDependentUI() {
  renderCipherVisualizer();
  renderAttack();
  $('#playCipher').setAttribute('aria-label', state.cipher.playing ? t('pauseEncryption') : t('playEncryption'));
  $('#playAttack').setAttribute('aria-label', state.attack.playing ? t('pauseAttack') : t('playAttack'));
}

function init() {
  applyStaticTranslations();

  $$('.lab-tab').forEach((tab) => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
  $$('[data-jump]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.jump, true)));

  $('#buildCipher').addEventListener('click', buildCipher);
  $('#resetCipher').addEventListener('click', resetCipher);
  $('#playCipher').addEventListener('click', toggleCipherPlayback);
  $('#prevStep').addEventListener('click', () => stepCipher(-1));
  $('#nextStep').addEventListener('click', () => stepCipher(1));
  $('#sendToAttack').addEventListener('click', sendCipherToAttack);
  $('#key').addEventListener('input', () => $('#key').setCustomValidity(''));

  $('#loadDemo').addEventListener('click', () => loadAttackDemo(true));
  $('#analyzeAttack').addEventListener('click', analyzeAttack);
  $('#playAttack').addEventListener('click', toggleAttackPlayback);
  $('#prevAttack').addEventListener('click', () => stepAttack(-1));
  $('#nextAttack').addEventListener('click', () => stepAttack(1));
  $('#attackCiphertext').addEventListener('input', updateAttackLetterCount);
  $('#languageToggle').addEventListener('click', () => {
    setLanguage(getLanguage() === 'en' ? 'tr' : 'en');
    refreshLanguageDependentUI();
  });

  buildCipher();
  loadAttackDemo(false);
  renderAttack();
}

init();
