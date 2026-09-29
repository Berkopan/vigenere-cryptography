const STORAGE_KEY = 'cipherscope-language';

const translations = {
  en: {
    static: {
      title: 'CipherScope — Vigenère & Kasiski Lab',
      description: 'An interactive Vigenère cipher and Kasiski examination visualizer.',
      brandSubtitle: 'classical cryptography lab',
      browserStatus: 'runs entirely in your browser',
      eyebrow: '<span>01</span> INTERACTIVE ALGORITHM VISUALIZER',
      heroTitle: 'See a cipher <em>move</em>,<br />then watch it <em>break</em>.',
      heroLead: 'Explore how the Vigenère cipher shifts every letter with a repeating key, then follow the exact clues a Kasiski examination uses to expose that repetition.',
      openLab: 'Open encryption lab <span>→</span>',
      runAttack: 'Run Kasiski attack',
      liveTransformation: 'LIVE TRANSFORMATION',
      vigenereTabTitle: 'Vigenère Lab',
      vigenereTabSubtitle: 'Build the ciphertext',
      kasiskiTabTitle: 'Kasiski Attack',
      kasiskiTabSubtitle: 'Find the repeating key',
      vigenereKicker: 'VIGENÈRE CIPHER',
      vigenereTitle: 'Encrypt one letter at a time.',
      vigenereDescription: 'Letters are mapped to 0–25. Each plaintext value is shifted by the matching key value: <code>Cᵢ = (Pᵢ + Kᵢ) mod 26</code>.',
      coreIdea: 'Core idea',
      coreIdeaTitle: 'One message, many Caesar shifts.',
      coreIdeaBody: 'The key repeats across letters, so the active shift keeps changing.',
      plaintext: 'Plaintext',
      key: 'Key',
      alphabet: 'Alphabet',
      buildCipher: 'Build cipher <span>→</span>',
      ciphertext: 'Ciphertext',
      sendToAttack: 'Send this ciphertext to Kasiski lab <span>→</span>',
      currentStep: 'CURRENT STEP',
      speed: 'Speed',
      plain: 'PLAIN',
      shifted: 'SHIFTED',
      letterTimeline: 'Letter timeline',
      timelineInitial: 'showing first symbols',
      attackKicker: 'KASISKI EXAMINATION + FREQUENCY ANALYSIS',
      attackTitle: 'Turn repetition into a key.',
      attackDescription: 'Kasiski reveals likely <em>key lengths</em>, not the key itself. Once the period is known, each key position becomes a Caesar cipher that can be attacked statistically.',
      distinction: 'Important distinction',
      distinctionTitle: 'Kasiski narrows the search space.',
      distinctionBody: 'This lab follows it with per-column frequency analysis to recover the actual key.',
      attackCiphertext: 'Ciphertext',
      attackHint: 'Use your own text or load the prepared demo.',
      loadDemo: 'Load demo',
      searchKeyLengths: 'Search key lengths',
      letters: 'Letters',
      analyzeCiphertext: 'Analyze ciphertext <span>→</span>',
      attackPhase: 'ATTACK PHASE',
      whyRepetition: 'Why repetition leaks',
      whyRepetitionBody: 'If the same plaintext fragment lands under the same section of a repeating key, it receives the same sequence of shifts and produces the same ciphertext fragment.',
      whyDistances: 'Why distances matter',
      whyDistancesBody: 'The distance between matching ciphertext fragments is often a multiple of the key length. Factoring several distances makes that hidden period visible.',
      whyKey: 'Why the key can follow',
      whyKeyBody: 'Split the text by that period and every column uses one fixed Caesar shift. English letter frequencies can then expose each shift independently.',
      footerBuilt: 'Built as a visual cryptography lab.',
      footerWarning: 'Educational use · Classical ciphers are not secure for modern data.',
    },
    dynamic: {
      ready: 'READY',
      pressPlay: 'Press play or step forward.',
      pressPlayBody: 'The active plaintext letter, key letter, numeric shift and output will light up together.',
      letter: 'LETTER',
      shiftsBy: ({ input, shift, key }) => `${input} shifts by ${shift} because the key letter is ${key}.`,
      mapping: ({ input, inputValue, key, keyValue, output }) => `${input} maps to ${inputValue}; ${key} maps to ${keyValue}. Wrap around the alphabet with modulo 26 to get ${output}.`,
      timelineWindow: ({ start, end, total }) => `letters ${start}–${end} of ${total}`,
      noLetters: 'no letters yet',
      timelineLabels: ['PLAIN', 'KEY', 'SHIFT', 'CIPHER'],
      playEncryption: 'Play encryption',
      pauseEncryption: 'Pause encryption',
      playAttack: 'Play attack',
      pauseAttack: 'Pause attack',
      keyValidation: 'Use at least one A–Z letter.',
      shortCipherWarning: 'Kasiski needs repeated patterns, so very short ciphertexts often provide weak or no evidence. Try a longer message or load the demo.',
      noRepeatsWarning: 'No useful repeated 3–5 letter sequences were found. Kasiski cannot estimate a key period from this ciphertext alone.',
      readyLabel: 'Ready',
      phases: [
        { short: 'Repeats', label: 'Find repeated n-grams' },
        { short: 'Distances', label: 'Measure distances' },
        { short: 'Factors', label: 'Factor the distances' },
        { short: 'Columns', label: 'Solve Caesar columns' },
        { short: 'Decrypt', label: 'Rebuild the plaintext' },
      ],
      phase1Eyebrow: 'PHASE ONE · PATTERN SCAN',
      phase1Title: 'Look for repeated ciphertext fragments.',
      phase1Body: 'Kasiski starts with repeated groups of characters. Longer repeats are less likely to appear by accident, so 3–5 letter n-grams are useful evidence.',
      repeatedNgrams: 'Repeated n-grams',
      highlightedExample: 'Highlighted example',
      occurrences: 'Occurrences',
      phase2Eyebrow: 'PHASE TWO · DISTANCES',
      phase2Title: 'Measure the gaps between repeats.',
      phase2Body: 'If two identical plaintext fragments were encrypted under the same key alignment, the distance between them is often a multiple of the key length.',
      positions: 'positions',
      noDistancesTitle: 'No repeat distances found',
      noDistancesBody: 'Use a longer ciphertext to give Kasiski more evidence.',
      phase3Eyebrow: 'PHASE THREE · FACTORIZATION',
      phase3Title: 'Count which factors keep appearing.',
      phase3Body: 'Each repeat distance is factored. A factor that explains many distances is a strong candidate for the repeating key period. Click another bar to test it.',
      noFactorEvidence: 'No factor evidence available.',
      selectedPeriod: 'Selected period',
      selectedPeriodBody: ({ ic }) => `This factor explains the strongest set of repeat distances. Average column IC: ${ic}.`,
      selectedPeriodEmpty: 'Kasiski needs repeated fragments before it can suggest a key length.',
      phase4Eyebrow: 'PHASE FOUR · COLUMN ATTACK',
      phase4Title: 'Turn the period into Caesar ciphers.',
      phase4Body: ({ period }) => `With period ${period}, every ${period}th ciphertext letter was shifted by the same key letter. We compare 26 possible shifts against English letter frequencies.`,
      column: 'Column',
      confidenceTitle: 'Separation from the runner-up shift',
      noColumns: 'No columns to analyze.',
      recoveredKeyCandidate: 'Recovered key candidate',
      phase5Eyebrow: 'PHASE FIVE · DECRYPTION',
      phase5Title: 'Use the recovered shifts in reverse.',
      phase5Body: 'Subtract the recovered key values instead of adding them. If the period and per-column shifts are correct, readable plaintext reappears.',
      noPlaintext: 'No plaintext candidate could be produced.',
      keyLength: 'Key length',
      recoveredKey: 'Recovered key',
      resultType: 'Result type',
      statisticalCandidate: 'statistical candidate',
      unavailable: 'unavailable',
      emptyAttackTitle: 'Load a ciphertext to begin.',
      emptyAttackBody: 'The prepared demo is intentionally long enough to make repeated patterns, distance factors and frequency analysis visible.',
    },
  },
  tr: {
    static: {
      title: 'CipherScope — Vigenère ve Kasiski Laboratuvarı',
      description: 'Vigenère şifrelemesini ve Kasiski incelemesini adım adım gösteren etkileşimli görselleştirici.',
      brandSubtitle: 'klasik kriptografi laboratuvarı',
      browserStatus: 'tamamen tarayıcında çalışır',
      eyebrow: '<span>01</span> ETKİLEŞİMLİ ALGORİTMA GÖRSELLEŞTİRİCİ',
      heroTitle: 'Bir şifrenin <em>oluşumunu</em> gör,<br />sonra nasıl <em>kırıldığını</em> izle.',
      heroLead: 'Vigenère şifrelemesinin tekrar eden bir anahtarla her harfi nasıl kaydırdığını keşfet; ardından Kasiski incelemesinin bu tekrarı hangi ipuçlarıyla ortaya çıkardığını adım adım izle.',
      openLab: 'Şifreleme laboratuvarını aç <span>→</span>',
      runAttack: 'Kasiski saldırısını çalıştır',
      liveTransformation: 'CANLI DÖNÜŞÜM',
      vigenereTabTitle: 'Vigenère Laboratuvarı',
      vigenereTabSubtitle: 'Şifreli metni oluştur',
      kasiskiTabTitle: 'Kasiski Saldırısı',
      kasiskiTabSubtitle: 'Tekrar eden anahtarı bul',
      vigenereKicker: 'VIGENÈRE ŞİFRELEMESİ',
      vigenereTitle: 'Metni harf harf şifrele.',
      vigenereDescription: 'Harfler 0–25 aralığına eşlenir. Her düz metin değeri, karşılık gelen anahtar değeri kadar kaydırılır: <code>Cᵢ = (Pᵢ + Kᵢ) mod 26</code>.',
      coreIdea: 'Temel fikir',
      coreIdeaTitle: 'Tek mesaj, birçok Sezar kaydırması.',
      coreIdeaBody: 'Anahtar harfler boyunca tekrar eder; bu yüzden uygulanan kaydırma sürekli değişir.',
      plaintext: 'Düz metin',
      key: 'Anahtar',
      alphabet: 'Alfabe',
      buildCipher: 'Şifreyi oluştur <span>→</span>',
      ciphertext: 'Şifreli metin',
      sendToAttack: 'Bu şifreli metni Kasiski laboratuvarına gönder <span>→</span>',
      currentStep: 'MEVCUT ADIM',
      speed: 'Hız',
      plain: 'DÜZ',
      shifted: 'KAYDIRILMIŞ',
      letterTimeline: 'Harf zaman çizelgesi',
      timelineInitial: 'ilk semboller gösteriliyor',
      attackKicker: 'KASISKI İNCELEMESİ + FREKANS ANALİZİ',
      attackTitle: 'Tekrardan anahtara ulaş.',
      attackDescription: 'Kasiski anahtarın kendisini değil, olası <em>anahtar uzunluklarını</em> ortaya çıkarır. Periyot belirlendiğinde her anahtar konumu ayrı bir Sezar şifresine dönüşür ve istatistiksel olarak analiz edilebilir.',
      distinction: 'Önemli ayrım',
      distinctionTitle: 'Kasiski arama uzayını daraltır.',
      distinctionBody: 'Bu laboratuvar, gerçek anahtarı elde etmek için Kasiski sonrasında sütun bazlı frekans analizi uygular.',
      attackCiphertext: 'Şifreli metin',
      attackHint: 'Kendi metnini kullan veya hazırlanmış demoyu yükle.',
      loadDemo: 'Demoyu yükle',
      searchKeyLengths: 'Anahtar uzunluğu ara',
      letters: 'Harf',
      analyzeCiphertext: 'Şifreli metni analiz et <span>→</span>',
      attackPhase: 'SALDIRI AŞAMASI',
      whyRepetition: 'Tekrar neden bilgi sızdırır?',
      whyRepetitionBody: 'Aynı düz metin parçası tekrar eden anahtarın aynı bölümüne denk gelirse aynı kaydırma dizisini alır ve aynı şifreli metin parçasını üretir.',
      whyDistances: 'Mesafeler neden önemli?',
      whyDistancesBody: 'Eşleşen şifreli metin parçaları arasındaki uzaklık çoğu zaman anahtar uzunluğunun katıdır. Birkaç uzaklığın çarpanlarını incelemek gizli periyodu görünür hale getirir.',
      whyKey: 'Anahtar nasıl ortaya çıkar?',
      whyKeyBody: 'Metni bu periyoda göre sütunlara ayırınca her sütun tek bir sabit Sezar kaydırması kullanır. İngilizce harf frekansları her kaydırmayı bağımsız olarak ortaya çıkarabilir.',
      footerBuilt: 'Görsel bir kriptografi laboratuvarı olarak geliştirildi.',
      footerWarning: 'Eğitim amaçlıdır · Klasik şifreler modern veriler için güvenli değildir.',
    },
    dynamic: {
      ready: 'HAZIR',
      pressPlay: 'Oynat düğmesine bas veya bir adım ilerle.',
      pressPlayBody: 'Etkin düz metin harfi, anahtar harfi, sayısal kaydırma ve sonuç aynı anda vurgulanacak.',
      letter: 'HARF',
      shiftsBy: ({ input, shift, key }) => `${input}, anahtar harfi ${key} olduğu için ${shift} konum kaydırılır.`,
      mapping: ({ input, inputValue, key, keyValue, output }) => `${input} → ${inputValue}; ${key} → ${keyValue}. Mod 26 ile alfabenin başına sarıldığında sonuç ${output} olur.`,
      timelineWindow: ({ start, end, total }) => `${total} harfin ${start}–${end} arası`,
      noLetters: 'henüz harf yok',
      timelineLabels: ['DÜZ', 'ANAHTAR', 'KAYDIR', 'ŞİFRE'],
      playEncryption: 'Şifrelemeyi oynat',
      pauseEncryption: 'Şifrelemeyi duraklat',
      playAttack: 'Saldırıyı oynat',
      pauseAttack: 'Saldırıyı duraklat',
      keyValidation: 'En az bir A–Z harfi kullan.',
      shortCipherWarning: 'Kasiski tekrar eden örüntülere ihtiyaç duyar; bu yüzden çok kısa şifreli metinler zayıf veya yetersiz kanıt üretir. Daha uzun bir mesaj dene ya da demoyu yükle.',
      noRepeatsWarning: 'Kullanışlı, tekrar eden 3–5 harfli bir dizi bulunamadı. Kasiski yalnızca bu şifreli metinden anahtar periyodunu tahmin edemiyor.',
      readyLabel: 'Hazır',
      phases: [
        { short: 'Tekrarlar', label: 'Tekrar eden n-gramları bul' },
        { short: 'Mesafeler', label: 'Tekrarlar arasındaki mesafeleri ölç' },
        { short: 'Çarpanlar', label: 'Mesafeleri çarpanlarına ayır' },
        { short: 'Sütunlar', label: 'Sezar sütunlarını çöz' },
        { short: 'Çöz', label: 'Düz metni yeniden oluştur' },
      ],
      phase1Eyebrow: 'BİRİNCİ AŞAMA · ÖRÜNTÜ TARAMASI',
      phase1Title: 'Tekrar eden şifreli metin parçalarını ara.',
      phase1Body: 'Kasiski, tekrar eden karakter gruplarını bulmakla başlar. Uzun tekrarların tesadüfen oluşma olasılığı daha düşüktür; bu nedenle 3–5 harfli n-gramlar güçlü kanıt sağlar.',
      repeatedNgrams: 'Tekrar eden n-gramlar',
      highlightedExample: 'Vurgulanan örnek',
      occurrences: 'Tekrar sayısı',
      phase2Eyebrow: 'İKİNCİ AŞAMA · MESAFELER',
      phase2Title: 'Tekrarlar arasındaki boşlukları ölç.',
      phase2Body: 'Aynı iki düz metin parçası aynı anahtar hizasında şifrelenmişse aralarındaki mesafe çoğu zaman anahtar uzunluğunun bir katıdır.',
      positions: 'konumlar',
      noDistancesTitle: 'Tekrar mesafesi bulunamadı',
      noDistancesBody: 'Kasiski’ye daha fazla kanıt vermek için daha uzun bir şifreli metin kullan.',
      phase3Eyebrow: 'ÜÇÜNCÜ AŞAMA · ÇARPANLARA AYIRMA',
      phase3Title: 'Hangi çarpanların sürekli tekrar ettiğini say.',
      phase3Body: 'Her tekrar mesafesi çarpanlarına ayrılır. Birçok mesafeyi açıklayan çarpan, tekrar eden anahtar periyodu için güçlü bir adaydır. Denemek için başka bir bara tıklayabilirsin.',
      noFactorEvidence: 'Çarpan kanıtı bulunamadı.',
      selectedPeriod: 'Seçilen periyot',
      selectedPeriodBody: ({ ic }) => `Bu çarpan tekrar mesafelerinin en güçlü bölümünü açıklıyor. Ortalama sütun IC değeri: ${ic}.`,
      selectedPeriodEmpty: 'Kasiski, anahtar uzunluğu önerebilmek için tekrar eden parçalara ihtiyaç duyar.',
      phase4Eyebrow: 'DÖRDÜNCÜ AŞAMA · SÜTUN SALDIRISI',
      phase4Title: 'Periyodu Sezar şifrelerine dönüştür.',
      phase4Body: ({ period }) => `Periyot ${period} olduğunda şifreli metindeki her ${period}. harf aynı anahtar harfiyle kaydırılmıştır. 26 olası kaydırmayı İngilizce harf frekanslarıyla karşılaştırıyoruz.`,
      column: 'Sütun',
      confidenceTitle: 'İkinci en iyi kaydırmaya göre ayrışma',
      noColumns: 'Analiz edilecek sütun yok.',
      recoveredKeyCandidate: 'Elde edilen anahtar adayı',
      phase5Eyebrow: 'BEŞİNCİ AŞAMA · ŞİFRE ÇÖZME',
      phase5Title: 'Bulunan kaydırmaları ters yönde uygula.',
      phase5Body: 'Anahtar değerlerini eklemek yerine çıkar. Periyot ve sütun kaydırmaları doğruysa okunabilir düz metin yeniden ortaya çıkar.',
      noPlaintext: 'Düz metin adayı üretilemedi.',
      keyLength: 'Anahtar uzunluğu',
      recoveredKey: 'Bulunan anahtar',
      resultType: 'Sonuç türü',
      statisticalCandidate: 'istatistiksel aday',
      unavailable: 'kullanılamıyor',
      emptyAttackTitle: 'Başlamak için bir şifreli metin yükle.',
      emptyAttackBody: 'Hazırlanan demo; tekrar eden örüntüleri, mesafe çarpanlarını ve frekans analizini görünür kılacak kadar uzun tutuldu.',
    },
  },
};

let currentLanguage = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') return saved;
  } catch {}
  return navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
})();

const staticBindings = [
  ['.brand-copy small', 'brandSubtitle'],
  ['.status-dot', 'browserStatus', (value) => `<i></i> ${value}`],
  ['.eyebrow', 'eyebrow', true],
  ['.hero h1', 'heroTitle', true],
  ['.hero-lead', 'heroLead'],
  ['[data-jump="encrypt"]', 'openLab', true],
  ['[data-jump="attack"]', 'runAttack'],
  ['.visual-topline span:first-child', 'liveTransformation'],
  ['[data-tab="encrypt"] strong', 'vigenereTabTitle'],
  ['[data-tab="encrypt"] small', 'vigenereTabSubtitle'],
  ['[data-tab="attack"] strong', 'kasiskiTabTitle'],
  ['[data-tab="attack"] small', 'kasiskiTabSubtitle'],
  ['[data-panel="encrypt"] .panel-heading .section-kicker', 'vigenereKicker'],
  ['[data-panel="encrypt"] .panel-heading h2', 'vigenereTitle'],
  ['[data-panel="encrypt"] .panel-heading > div:first-child > p:last-child', 'vigenereDescription', true],
  ['[data-panel="encrypt"] .concept-label', 'coreIdea'],
  ['[data-panel="encrypt"] .concept-card strong', 'coreIdeaTitle'],
  ['[data-panel="encrypt"] .concept-card small', 'coreIdeaBody'],
  ['label[for="plaintext"]', 'plaintext'],
  ['label[for="key"]', 'key'],
  ['.mini-field .field-label', 'alphabet'],
  ['#buildCipher', 'buildCipher', true],
  ['.output-box .field-label', 'ciphertext'],
  ['#sendToAttack', 'sendToAttack', true],
  ['[data-panel="encrypt"] .micro-label', 'currentStep'],
  ['[data-panel="encrypt"] .speed-control', 'speed', (value, element) => `${value}${element.querySelector('input')?.outerHTML ?? ''}`],
  ['.alphabet-map .alphabet-label:first-child', 'plain'],
  ['.alphabet-map .alphabet-label:nth-child(3)', 'shifted'],
  ['.timeline-head span', 'letterTimeline'],
  ['#timelineWindow', 'timelineInitial'],
  ['[data-panel="attack"] .panel-heading .section-kicker', 'attackKicker'],
  ['[data-panel="attack"] .panel-heading h2', 'attackTitle'],
  ['[data-panel="attack"] .panel-heading > div:first-child > p:last-child', 'attackDescription', true],
  ['[data-panel="attack"] .concept-label', 'distinction'],
  ['[data-panel="attack"] .concept-card strong', 'distinctionTitle'],
  ['[data-panel="attack"] .concept-card small', 'distinctionBody'],
  ['.attack-input-card .demo-row .field-label', 'attackCiphertext'],
  ['.attack-input-card .demo-row small', 'attackHint'],
  ['#loadDemo', 'loadDemo'],
  ['label[for="maxKeyLength"]', 'searchKeyLengths'],
  ['.signal-stat span', 'letters'],
  ['#analyzeAttack', 'analyzeCiphertext', true],
  ['[data-panel="attack"] .micro-label', 'attackPhase'],
  ['[data-panel="attack"] .speed-control', 'speed', (value, element) => `${value}${element.querySelector('input')?.outerHTML ?? ''}`],
  ['.explain-grid article:nth-child(1) h3', 'whyRepetition'],
  ['.explain-grid article:nth-child(1) p', 'whyRepetitionBody'],
  ['.explain-grid article:nth-child(2) h3', 'whyDistances'],
  ['.explain-grid article:nth-child(2) p', 'whyDistancesBody'],
  ['.explain-grid article:nth-child(3) h3', 'whyKey'],
  ['.explain-grid article:nth-child(3) p', 'whyKeyBody'],
  ['.site-footer div span', 'footerBuilt'],
  ['.site-footer > span', 'footerWarning'],
];

export function getLanguage() {
  return currentLanguage;
}

export function t(key, params = {}) {
  const value = translations[currentLanguage].dynamic[key];
  return typeof value === 'function' ? value(params) : value;
}

export function getAttackPhases() {
  return translations[currentLanguage].dynamic.phases;
}

export function applyStaticTranslations() {
  const language = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.title = language.static.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', language.static.description);

  staticBindings.forEach(([selector, key, mode]) => {
    const element = document.querySelector(selector);
    if (!element) return;
    const value = language.static[key];
    if (typeof mode === 'function') {
      element.innerHTML = mode(value, element);
    } else if (mode === true) {
      element.innerHTML = value;
    } else {
      element.textContent = value;
    }
  });

  const button = document.querySelector('#languageToggle');
  if (button) {
    button.textContent = currentLanguage === 'en' ? 'TR' : 'EN';
    button.setAttribute('aria-label', currentLanguage === 'en' ? 'Türkçe arayüze geç' : 'Switch to English');
    button.setAttribute('title', currentLanguage === 'en' ? 'Türkçe' : 'English');
  }

  const reset = document.querySelector('#resetCipher');
  if (reset) {
    const label = currentLanguage === 'tr' ? 'Animasyonu sıfırla' : 'Reset animation';
    reset.setAttribute('title', label);
    reset.setAttribute('aria-label', label);
  }

  const prevStep = document.querySelector('#prevStep');
  if (prevStep) prevStep.setAttribute('aria-label', currentLanguage === 'tr' ? 'Önceki adım' : 'Previous step');
  const nextStep = document.querySelector('#nextStep');
  if (nextStep) nextStep.setAttribute('aria-label', currentLanguage === 'tr' ? 'Sonraki adım' : 'Next step');
  const prevAttack = document.querySelector('#prevAttack');
  if (prevAttack) prevAttack.setAttribute('aria-label', currentLanguage === 'tr' ? 'Önceki saldırı aşaması' : 'Previous attack phase');
  const nextAttack = document.querySelector('#nextAttack');
  if (nextAttack) nextAttack.setAttribute('aria-label', currentLanguage === 'tr' ? 'Sonraki saldırı aşaması' : 'Next attack phase');
}

export function setLanguage(language) {
  if (language !== 'tr' && language !== 'en') return currentLanguage;
  currentLanguage = language;
  try {
    localStorage.setItem(STORAGE_KEY, currentLanguage);
  } catch {}
  applyStaticTranslations();
  return currentLanguage;
}
