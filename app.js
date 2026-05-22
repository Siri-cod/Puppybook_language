import {
  getAllEntries,
  getAllEntriesLocal,
  getEntry,
  putEntry,
  deleteEntry,
  blobToBase64,
  base64ToBlob,
} from './db.js';
import {
  initSync,
  isEnabled,
  getSyncStatus,
  onEntriesChanged,
  getAllEntries as getAllCloudEntries,
  putEntry as putCloudEntry,
  loadConfig,
  clearSync,
} from './sync.js';
import {
  deriveVaultId,
  getVaultId,
  setVaultId,
  clearVaultId,
  isVaultUnlocked,
  readRememberedVaultId,
  writeRememberedVaultId,
  clearRememberedVaultId,
} from './vault.js';
import {
  loadCollections,
  saveCollections,
  newCollectionId,
  isMetaId,
  SUGGESTED_EMOJIS,
} from './collections.js';
import {
  reloadLanguages,
  saveLanguages,
  resetLanguagesMemory,
  getLanguages,
  getLanguagesExport,
  langLabel,
  langTag,
  langCss,
  isSecondSlot,
  SLOTS,
} from './languages.js';

const $ = (sel) => document.querySelector(sel);

const listEl = $('#list');
const emptyEl = $('#empty');
const searchEl = $('#search');
const fabEl = $('#fab');
const editorDialog = $('#editor');
const detailDialog = $('#detail');
const form = $('#form');
const editorTitle = $('#editor-title');
const deTextInput = $('#de-text');
const zhTextInput = $('#zh-text');
const deAudioFileInput = $('#de-audio-file');
const zhAudioFileInput = $('#zh-audio-file');
const deAudioPreview = $('#de-audio-preview');
const zhAudioPreview = $('#zh-audio-preview');
const dePreviewPlayer = $('#de-preview-player');
const zhPreviewPlayer = $('#zh-preview-player');
const clearDeAudioBtn = $('#clear-de-audio');
const clearZhAudioBtn = $('#clear-zh-audio');
const deRecordBtn = $('#de-record-btn');
const zhRecordBtn = $('#zh-record-btn');
const deRecordStatus = $('#de-record-status');
const zhRecordStatus = $('#zh-record-status');
const cancelBtn = $('#cancel');
const detailDeText = $('#detail-de-text');
const detailZhText = $('#detail-zh-text');
const editEntryBtn = $('#edit-entry');
const deleteEntryBtn = $('#delete-entry');
const closeDetailBtn = $('#close-detail');
const exportBtn = $('#export-btn');
const importFile = $('#import-file');
const syncStatusEl = $('#sync-status');
const sortSelectEl = $('#sort-select');
const detailMetaEl = $('#detail-meta');
const filterTabsEl = $('#filter-tabs');
const vaultUnlockDialog = $('#vault-unlock');
const vaultForm = $('#vault-form');
const vaultPass1 = $('#vault-pass1');
const vaultPass2 = $('#vault-pass2');
const vaultRemember = $('#vault-remember');
const vaultErrorEl = $('#vault-error');
const lockVaultBtn = $('#lock-vault-btn');
const languagesSettingsBtn = $('#languages-settings-btn');
const languagesEditorDialog = $('#languages-editor');
const languagesForm = $('#languages-form');
const lang1LabelInput = $('#lang1-label');
const lang1TagInput = $('#lang1-tag');
const lang2LabelInput = $('#lang2-label');
const lang2TagInput = $('#lang2-tag');
const languagesCancelBtn = $('#languages-cancel');
const collectionEditorDialog = $('#collection-editor');
const collectionForm = $('#collection-form');
const collectionEditorTitle = $('#collection-editor-title');
const collectionEmojiInput = $('#collection-emoji');
const collectionNameInput = $('#collection-name');
const collectionDeleteBtn = $('#collection-delete');
const collectionCancelBtn = $('#collection-cancel');
const emojiSuggestionsEl = $('#emoji-suggestions');

let entries = [];
let collections = []; // {id, name, emoji, createdAt}[]
let currentFilter = 'all'; // 'all' | collection.id
let currentSort = 'time-desc';
let editingId = null;
let editingCollectionId = null; // null = creating
/** @type {{ de: object|null, zh: object|null }} */
let pendingAudio = { de: null, zh: null };
let activeDetailId = null;
let objectUrls = new Set();
/** @type {{ lang: string, recorder: MediaRecorder, stream: MediaStream, btn: HTMLElement, statusEl: HTMLElement }|null} */
let activeRecording = null;

function uid() {
  return crypto.randomUUID();
}

function playKey(id, lang) {
  return `${id}:${lang}`;
}

function deriveCollections(entry) {
  const list = Array.isArray(entry.collections) ? entry.collections.slice() : [];
  // Back-compat: migrate the old boolean favorites into the new array form.
  if (entry.favPuppy && !list.includes('puppy')) list.push('puppy');
  if (entry.favFlower && !list.includes('flower')) list.push('flower');
  return Array.from(new Set(list.filter((id) => typeof id === 'string' && id)));
}

/** @param {object} entry */
function normalizeEntry(entry) {
  if (!entry) return entry;
  if (entry.deText != null || entry.zhText != null) {
    return {
      ...entry,
      deText: entry.deText ?? '',
      zhText: entry.zhText ?? '',
      deAudioBase64: entry.deAudioBase64 ?? null,
      deAudioMime: entry.deAudioMime ?? null,
      deAudioName: entry.deAudioName ?? null,
      zhAudioBase64: entry.zhAudioBase64 ?? null,
      zhAudioMime: entry.zhAudioMime ?? null,
      zhAudioName: entry.zhAudioName ?? null,
      collections: deriveCollections(entry),
    };
  }
  return {
    ...entry,
    deText: entry.text ?? '',
    zhText: entry.note ?? '',
    deAudioBase64: entry.audioBase64 ?? null,
    deAudioMime: entry.audioMime ?? null,
    deAudioName: entry.audioName ?? null,
    zhAudioBase64: entry.zhAudioBase64 ?? null,
    zhAudioMime: entry.zhAudioMime ?? null,
    zhAudioName: entry.zhAudioName ?? null,
    collections: deriveCollections(entry),
  };
}

function toStoredEntry(entry) {
  const e = normalizeEntry(entry);
  const vaultId = getVaultId();
  return {
    id: e.id,
    vaultId,
    deText: e.deText,
    zhText: e.zhText,
    deAudioBase64: e.deAudioBase64,
    deAudioMime: e.deAudioMime,
    deAudioName: e.deAudioName,
    zhAudioBase64: e.zhAudioBase64,
    zhAudioMime: e.zhAudioMime,
    zhAudioName: e.zhAudioName,
    collections: e.collections,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

function getEntryAudio(entry, lang) {
  const e = normalizeEntry(entry);
  if (lang === SLOTS.L1) {
    return {
      base64: e.deAudioBase64,
      mime: e.deAudioMime || 'audio/mpeg',
      name: e.deAudioName,
    };
  }
  return {
    base64: e.zhAudioBase64,
    mime: e.zhAudioMime || 'audio/mpeg',
    name: e.zhAudioName,
  };
}

function hasEntryAudio(entry, lang) {
  return !!getEntryAudio(normalizeEntry(entry), lang).base64;
}

function revokeUrl(url) {
  if (url && objectUrls.has(url)) {
    URL.revokeObjectURL(url);
    objectUrls.delete(url);
  }
}

function audioUrl(entry, lang) {
  const a = getEntryAudio(normalizeEntry(entry), lang);
  if (!a.base64) return null;
  const blob = base64ToBlob(a.base64, a.mime);
  const url = URL.createObjectURL(blob);
  objectUrls.add(url);
  return url;
}

const TZ = 'Europe/Berlin';

function formatDateShort(ts) {
  if (!ts) return '';
  const now = Date.now();
  const diffDays = Math.floor(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) /
      86400000
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const opts = { month: 'short', day: 'numeric', timeZone: TZ };
  if (
    new Date(ts).toLocaleDateString('en', { year: 'numeric', timeZone: TZ }) !==
    new Date(now).toLocaleDateString('en', { year: 'numeric', timeZone: TZ })
  ) {
    opts.year = 'numeric';
  }
  return new Date(ts).toLocaleDateString('en', opts);
}

function formatDateFull(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: TZ,
    timeZoneName: 'short',
  });
}

function applySort(list, sort) {
  const sorted = [...list];
  switch (sort) {
    case 'time-asc':
      sorted.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      break;
    case 'de-asc':
      sorted.sort((a, b) => (a.deText?.length ?? 0) - (b.deText?.length ?? 0));
      break;
    case 'de-desc':
      sorted.sort((a, b) => (b.deText?.length ?? 0) - (a.deText?.length ?? 0));
      break;
    case 'zh-asc':
      sorted.sort((a, b) => (a.zhText?.length ?? 0) - (b.zhText?.length ?? 0));
      break;
    case 'zh-desc':
      sorted.sort((a, b) => (b.zhText?.length ?? 0) - (a.zhText?.length ?? 0));
      break;
    default: // time-desc
      sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }
  return sorted;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function matchesSearch(entry, q) {
  if (!q) return true;
  const lower = q.toLowerCase();
  const e = normalizeEntry(entry);
  return (
    (e.deText || '').toLowerCase().includes(lower) ||
    (e.zhText || '').toLowerCase().includes(lower)
  );
}

const PLAYBACK_SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];
/** @type {{ de: number, zh: number }} */
let playbackSpeedByLang = { de: 1, zh: 1 };

function speedSelectHtml(lang) {
  const speed = playbackSpeedByLang[lang] ?? 1;
  const opts = PLAYBACK_SPEED_OPTIONS.map(
    (s) =>
      `<option value="${s}"${s === speed ? ' selected' : ''}>${s}×</option>`
  ).join('');
  return `<select class="speed-select speed-select--${lang}" data-lang="${lang}"
    aria-label="Playback speed">${opts}</select>`;
}

function applySpeedToInlineAudio(lang) {
  if (!inlineAudio) return;
  inlineAudio.playbackRate = playbackSpeedByLang[lang] ?? 1;
}

function progressBarHtml(lang) {
  const css = langCss(lang);
  const slot2 = isSecondSlot(lang);
  const progressClass = slot2 ? ` card-progress--${css}` : '';
  const fillClass = slot2 ? ` card-progress-fill--${css}` : '';
  return `<div class="card-progress${progressClass}" role="slider" aria-label="Playback progress" tabindex="0">
    <div class="card-progress-track">
      <div class="card-progress-fill${fillClass}"></div>
      <div class="card-progress-thumb"></div>
    </div>
    <span class="card-progress-time" aria-hidden="true">0:00 / 0:00</span>
  </div>`;
}

function buildLangRowHtml(lang, text, hasAudio) {
  const tag = langTag(lang);
  const css = langCss(lang);
  const controls = hasAudio
    ? `<div class="lang-playback">
         <button type="button" class="play-btn play-btn--${css}" data-lang="${lang}" aria-label="Play ${escapeAttr(tag)}">▶</button>
         ${speedSelectHtml(lang)}
         ${progressBarHtml(lang)}
       </div>`
    : `<p class="no-audio-hint">No audio</p>`;
  return `
    <section class="card-lang" data-lang="${lang}">
      <div class="lang-head">
        <span class="lang-tag lang-tag--${css}">${escapeHtml(tag)}</span>
        <p class="card-text">${escapeHtml(text || '(empty)')}</p>
      </div>
      <div class="lang-controls">${controls}</div>
    </section>
  `;
}

function emptyMessage() {
  if (currentFilter === 'all') return 'No entries yet. Tap + to add one.';
  const col = collections.find((c) => c.id === currentFilter);
  if (!col) return 'No entries in this collection yet.';
  return `No entries in your ${col.emoji} ${col.name} collection yet.`;
}

function buildCardFavsHtml(entry) {
  const owned = new Set(entry.collections || []);
  const timeStr = formatDateShort(entry.createdAt);
  const buttons = collections
    .map((c) => {
      const active = owned.has(c.id) ? ' active' : '';
      return `<button type="button" class="fav-btn${active}" data-collection="${escapeAttr(c.id)}"
        aria-label="${escapeAttr(c.name)}" aria-pressed="${owned.has(c.id)}"
        title="${escapeAttr(c.name)}">${escapeHtml(c.emoji)}</button>`;
    })
    .join('');
  return `<div class="card-favs">
    <span class="card-time" aria-hidden="true">${escapeHtml(timeStr)}</span>
    <div class="card-fav-btns">${buttons}</div>
  </div>`;
}

function escapeAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderList() {
  stopInlinePlayback();

  const q = searchEl.value.trim();
  let filtered = entries
    .filter((e) => e && !isMetaId(e.id))
    .map(normalizeEntry)
    .filter((e) => matchesSearch(e, q));

  if (currentFilter !== 'all') {
    filtered = filtered.filter((e) => (e.collections || []).includes(currentFilter));
  }

  filtered = applySort(filtered, currentSort);

  listEl.innerHTML = '';
  emptyEl.textContent = emptyMessage();
  emptyEl.classList.toggle('hidden', filtered.length > 0);

  for (const entry of filtered) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = entry.id;

    card.innerHTML = `
      <div class="card-body">
        ${buildLangRowHtml(SLOTS.L1, entry.deText, hasEntryAudio(entry, SLOTS.L1))}
        ${buildLangRowHtml(SLOTS.L2, entry.zhText, hasEntryAudio(entry, SLOTS.L2))}
        ${buildCardFavsHtml(entry)}
      </div>
    `;

    card.querySelectorAll('.card-progress').forEach((progressEl) => {
      const lang = progressEl.closest('.card-lang')?.dataset.lang;
      if (lang) attachProgressInteraction(progressEl, entry.id, lang);
    });

    card.addEventListener('click', (e) => {
      if (e.target.closest('.speed-select')) {
        e.stopPropagation();
        return;
      }
      if (e.target.closest('.fav-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.fav-btn');
        toggleFav(entry.id, btn.dataset.collection);
        return;
      }
      if (e.target.closest('.play-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.play-btn');
        playInline(entry.id, btn.dataset.lang, btn);
        return;
      }
      if (e.target.closest('.card-progress')) return;
      openDetail(entry.id);
    });

    listEl.appendChild(card);
  }
}

let inlineAudio = null;
let inlinePlayingKey = null;
let inlineActiveBtn = null;
let inlineActiveUrl = null;
let inlineActiveProgress = null;

function setPlayButtonState(btn, playing) {
  btn.classList.toggle('playing', playing);
  btn.textContent = playing ? '❚❚' : '▶';
  btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function updateCardProgress(progressEl, current, duration) {
  const pct = duration > 0 && Number.isFinite(duration) ? (current / duration) * 100 : 0;
  const fill = progressEl.querySelector('.card-progress-fill');
  const thumb = progressEl.querySelector('.card-progress-thumb');
  const timeEl = progressEl.querySelector('.card-progress-time');
  if (fill) fill.style.width = `${pct}%`;
  if (thumb) thumb.style.left = `${pct}%`;
  if (timeEl) {
    timeEl.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }
  progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
}

function attachProgressInteraction(progressEl, entryId, lang) {
  let dragging = false;

  const scrub = (clientX, playAfter) => {
    applyProgressSeek(entryId, lang, progressEl, clientX, playAfter);
  };

  progressEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    dragging = true;
    progressEl.classList.add('scrubbing');
    progressEl.setPointerCapture(e.pointerId);
    scrub(e.clientX, false);
  });

  progressEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    scrub(e.clientX, false);
  });

  const endScrub = (e) => {
    if (!dragging) return;
    dragging = false;
    progressEl.classList.remove('scrubbing');
    if (progressEl.hasPointerCapture(e.pointerId)) {
      progressEl.releasePointerCapture(e.pointerId);
    }
    scrub(e.clientX, true);
  };

  progressEl.addEventListener('pointerup', endScrub);
  progressEl.addEventListener('pointercancel', endScrub);
}

function applyProgressSeek(id, lang, progressEl, clientX, playAfter = false) {
  const ratio = progressRatio(progressEl, clientX);
  const btn = progressEl.closest('.card-lang')?.querySelector('.play-btn');
  if (!btn) return;

  const entry = entries.find((e) => e.id === id);
  if (!hasEntryAudio(entry, lang)) return;

  const key = playKey(id, lang);

  const setTimeAndUi = () => {
    if (!Number.isFinite(inlineAudio.duration)) return;
    inlineAudio.currentTime = ratio * inlineAudio.duration;
    updateCardProgress(progressEl, inlineAudio.currentTime, inlineAudio.duration);
    if (playAfter && inlineAudio.paused) {
      inlineAudio.play().catch(() => {});
      setPlayButtonState(btn, true);
    }
  };

  if (inlinePlayingKey === key && inlineAudio) {
    if (inlineAudio.readyState >= 1) {
      setTimeAndUi();
    } else {
      inlineAudio.addEventListener('loadedmetadata', setTimeAndUi, { once: true });
    }
    return;
  }

  beginInlinePlayback(id, lang, btn, progressEl, { seekRatio: ratio, autoplay: playAfter });
}

function progressRatio(progressEl, clientX) {
  const track =
    progressEl.querySelector('.card-progress-track') || progressEl;
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function stopInlinePlayback() {
  if (inlineAudio) {
    inlineAudio.pause();
    inlineAudio.onended = null;
    inlineAudio.ontimeupdate = null;
    inlineAudio = null;
  }
  if (inlineActiveUrl) {
    revokeUrl(inlineActiveUrl);
    inlineActiveUrl = null;
  }
  if (inlineActiveBtn) {
    setPlayButtonState(inlineActiveBtn, false);
    inlineActiveBtn = null;
  }
  if (inlineActiveProgress) {
    updateCardProgress(inlineActiveProgress, 0, 1);
    inlineActiveProgress = null;
  }
  inlinePlayingKey = null;
}

function bindInlineAudioHandlers(key, progressEl) {
  inlineAudio.ontimeupdate = () => {
    if (inlinePlayingKey !== key || !progressEl) return;
    updateCardProgress(
      progressEl,
      inlineAudio.currentTime,
      inlineAudio.duration
    );
  };
  inlineAudio.onended = () => stopInlinePlayback();
}

function beginInlinePlayback(id, lang, btn, progressEl, opts = {}) {
  const { seekRatio = null, autoplay = true } = opts;
  const entry = entries.find((e) => e.id === id);
  if (!hasEntryAudio(entry, lang)) return;

  const key = playKey(id, lang);

  const startPlayback = () => {
    if (seekRatio != null && Number.isFinite(inlineAudio.duration)) {
      inlineAudio.currentTime = seekRatio * inlineAudio.duration;
    }
    if (progressEl) {
      updateCardProgress(
        progressEl,
        inlineAudio.currentTime,
        inlineAudio.duration
      );
    }
    if (autoplay) {
      inlineAudio.play().catch(() => {});
      setPlayButtonState(btn, true);
    } else {
      setPlayButtonState(btn, false);
    }
  };

  if (inlinePlayingKey === key && inlineAudio) {
    if (inlineAudio.readyState >= 1) {
      startPlayback();
    } else {
      inlineAudio.addEventListener('loadedmetadata', startPlayback, { once: true });
    }
    return;
  }

  stopInlinePlayback();

  const url = audioUrl(entry, lang);
  if (!url) return;

  inlineAudio = new Audio(url);
  inlineAudio.playbackRate = playbackSpeedByLang[lang] ?? 1;
  inlinePlayingKey = key;
  inlineActiveBtn = btn;
  inlineActiveUrl = url;
  inlineActiveProgress = progressEl;

  bindInlineAudioHandlers(key, progressEl);
  inlineAudio.addEventListener('loadedmetadata', startPlayback, { once: true });
}

function playInline(id, lang, btn) {
  const entry = entries.find((e) => e.id === id);
  if (!entry || !hasEntryAudio(entry, lang)) return;

  const progressEl = btn.closest('.card-lang')?.querySelector('.card-progress');
  const key = playKey(id, lang);

  if (inlinePlayingKey === key && inlineAudio) {
    if (!inlineAudio.paused) {
      inlineAudio.pause();
      setPlayButtonState(btn, false);
      return;
    }
    inlineAudio.play();
    setPlayButtonState(btn, true);
    return;
  }

  beginInlinePlayback(id, lang, btn, progressEl);
}

function recordUi(lang) {
  if (lang === SLOTS.L1) {
    return { btn: deRecordBtn, status: deRecordStatus };
  }
  return { btn: zhRecordBtn, status: zhRecordStatus };
}

function getSupportedRecordMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function setRecordUi(lang, recording) {
  const { btn, status } = recordUi(lang);
  btn.textContent = recording ? 'Stop' : 'Record';
  btn.classList.toggle('recording', recording);
  btn.setAttribute('aria-pressed', recording ? 'true' : 'false');
  status.classList.toggle('hidden', !recording);
}

function stopActiveRecording() {
  if (!activeRecording) return;
  const { recorder, stream } = activeRecording;
  if (recorder.state === 'recording') recorder.stop();
  else stream.getTracks().forEach((t) => t.stop());
}

function resetEditor() {
  stopActiveRecording();
  activeRecording = null;
  setRecordUi(SLOTS.L1, false);
  setRecordUi(SLOTS.L2, false);

  editingId = null;
  pendingAudio = { de: null, zh: null };
  editorTitle.textContent = 'Add entry';
  deTextInput.value = '';
  zhTextInput.value = '';
  deAudioFileInput.value = '';
  zhAudioFileInput.value = '';
  hideAudioPreview(SLOTS.L1);
  hideAudioPreview(SLOTS.L2);
}

function hideAudioPreview(lang) {
  const preview = lang === SLOTS.L1 ? deAudioPreview : zhAudioPreview;
  const player = lang === SLOTS.L1 ? dePreviewPlayer : zhPreviewPlayer;
  preview.classList.add('hidden');
  player.removeAttribute('src');
}

function showAudioPreview(lang, blob) {
  const preview = lang === SLOTS.L1 ? deAudioPreview : zhAudioPreview;
  const player = lang === SLOTS.L1 ? dePreviewPlayer : zhPreviewPlayer;
  const url = URL.createObjectURL(blob);
  objectUrls.add(url);
  player.src = url;
  preview.classList.remove('hidden');
}

function openEditor(id = null) {
  resetEditor();
  editingId = id;

  if (id) {
    editorTitle.textContent = 'Edit entry';
    const entry = normalizeEntry(entries.find((e) => e.id === id));
    if (entry) {
      deTextInput.value = entry.deText;
      zhTextInput.value = entry.zhText;
      if (entry.deAudioBase64) {
        pendingAudio.de = {
          blob: base64ToBlob(entry.deAudioBase64, entry.deAudioMime),
          mime: entry.deAudioMime,
          name: entry.deAudioName || `Existing ${langLabel(SLOTS.L1)} audio`,
          existing: true,
        };
        showAudioPreview(SLOTS.L1, pendingAudio.de.blob);
      }
      if (entry.zhAudioBase64) {
        pendingAudio.zh = {
          blob: base64ToBlob(entry.zhAudioBase64, entry.zhAudioMime),
          mime: entry.zhAudioMime,
          name: entry.zhAudioName || `Existing ${langLabel(SLOTS.L2)} audio`,
          existing: true,
        };
        showAudioPreview(SLOTS.L2, pendingAudio.zh.blob);
      }
    }
  }

  editorDialog.showModal();
}

function setPendingAudio(lang, blob, name) {
  pendingAudio[lang] = {
    blob,
    mime: blob.type || 'audio/webm',
    name,
    existing: false,
  };
  const fileInput = lang === SLOTS.L1 ? deAudioFileInput : zhAudioFileInput;
  fileInput.value = '';
  showAudioPreview(lang, blob);
}

function setupAudioFileInput(input, lang) {
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    if (activeRecording?.lang === lang) stopActiveRecording();
    setPendingAudio(lang, file, file.name);
  });
}

setupAudioFileInput(deAudioFileInput, SLOTS.L1);
setupAudioFileInput(zhAudioFileInput, SLOTS.L2);

async function toggleRecording(lang) {
  if (activeRecording?.lang === lang) {
    stopActiveRecording();
    return;
  }

  if (activeRecording) stopActiveRecording();

  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Recording is not supported in this browser. Please upload audio instead.');
    return;
  }
  if (typeof MediaRecorder === 'undefined') {
    alert('Recording is not supported in this browser. Please upload audio instead.');
    return;
  }

  const { btn, status } = recordUi(lang);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedRecordMime();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, {
        type: recorder.mimeType || mimeType || 'audio/webm',
      });
      setRecordUi(lang, false);
      activeRecording = null;

      if (blob.size === 0) {
        alert('No audio was recorded. Please try again.');
        return;
      }

      const label = langLabel(lang).toLowerCase().replace(/[^a-z0-9]+/gi, '-');
      const ext = blob.type.includes('mp4')
        ? 'm4a'
        : blob.type.includes('ogg')
          ? 'ogg'
          : 'webm';
      setPendingAudio(lang, blob, `${label}-recording-${Date.now()}.${ext}`);
    };

    recorder.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecordUi(lang, false);
      activeRecording = null;
      alert('Recording failed. Please try again.');
    };

    recorder.start();
    activeRecording = { lang, recorder, stream, btn, statusEl: status };
    setRecordUi(lang, true);
  } catch (err) {
    setRecordUi(lang, false);
    activeRecording = null;
    const msg =
      err.name === 'NotAllowedError'
        ? 'Please allow microphone access and try again'
        : err.message || 'Could not access microphone';
    alert(msg);
  }
}

deRecordBtn.addEventListener('click', () => toggleRecording(SLOTS.L1));
zhRecordBtn.addEventListener('click', () => toggleRecording(SLOTS.L2));

function clearAudioForLang(lang) {
  if (activeRecording?.lang === lang) stopActiveRecording();
  pendingAudio[lang] = { cleared: true };
  const fileInput = lang === SLOTS.L1 ? deAudioFileInput : zhAudioFileInput;
  fileInput.value = '';
  hideAudioPreview(lang);
}

clearDeAudioBtn.addEventListener('click', () => clearAudioForLang(SLOTS.L1));
clearZhAudioBtn.addEventListener('click', () => clearAudioForLang(SLOTS.L2));

cancelBtn.addEventListener('click', () => editorDialog.close());
editorDialog.addEventListener('close', () => stopActiveRecording());

for (const el of [deTextInput, zhTextInput]) {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.stopPropagation();
  });
}

async function resolveAudioForSave(lang) {
  const pending = pendingAudio[lang];
  if (pending?.cleared) return null;
  if (pending?.blob) {
    return {
      base64: await blobToBase64(pending.blob),
      mime: pending.mime,
      name: pending.name,
    };
  }
  if (editingId) {
    const old = normalizeEntry(entries.find((x) => x.id === editingId));
    const a = getEntryAudio(old, lang);
    if (a.base64) {
      return { base64: a.base64, mime: a.mime, name: a.name };
    }
  }
  return null;
}

function audioFieldsFromResolved(lang, audio) {
  const p = lang === SLOTS.L1 ? 'de' : 'zh';
  if (!audio) {
    return {
      [`${p}AudioBase64`]: null,
      [`${p}AudioMime`]: null,
      [`${p}AudioName`]: null,
    };
  }
  return {
    [`${p}AudioBase64`]: audio.base64,
    [`${p}AudioMime`]: audio.mime,
    [`${p}AudioName`]: audio.name,
  };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const deText = deTextInput.value.trim();
  const zhText = zhTextInput.value.trim();

  const deAudio = await resolveAudioForSave(SLOTS.L1);
  const zhAudio = await resolveAudioForSave(SLOTS.L2);

  if (!deText && !zhText && !deAudio && !zhAudio) {
    alert('Add at least some text or audio before saving');
    return;
  }

  const entry = toStoredEntry({
    id: editingId || uid(),
    deText,
    zhText,
    ...audioFieldsFromResolved(SLOTS.L1, deAudio),
    ...audioFieldsFromResolved(SLOTS.L2, zhAudio),
    createdAt: editingId
      ? entries.find((x) => x.id === editingId)?.createdAt ?? Date.now()
      : Date.now(),
    updatedAt: Date.now(),
  });

  await putEntry(entry);
  editorDialog.close();
  await loadEntries();
});

async function openDetail(id) {
  const entry = normalizeEntry(await getEntry(id));
  if (!entry) return;

  activeDetailId = id;
  detailDeText.textContent = entry.deText || '(empty)';
  detailZhText.textContent = entry.zhText || '(empty)';

  if (detailMetaEl) {
    const added = entry.createdAt ? `Added ${formatDateFull(entry.createdAt)}` : '';
    const edited =
      entry.updatedAt && entry.updatedAt - (entry.createdAt ?? 0) > 60000
        ? `Edited ${formatDateFull(entry.updatedAt)}`
        : '';
    detailMetaEl.textContent = [added, edited].filter(Boolean).join(' · ');
  }

  detailDialog.showModal();
}

detailDialog.addEventListener('close', () => {
  activeDetailId = null;
});

editEntryBtn.addEventListener('click', () => {
  const id = activeDetailId;
  detailDialog.close();
  openEditor(id);
});

deleteEntryBtn.addEventListener('click', async () => {
  if (!activeDetailId) return;
  if (!confirm('Delete this entry?')) return;
  await deleteEntry(activeDetailId);
  detailDialog.close();
  await loadEntries();
});

closeDetailBtn.addEventListener('click', () => detailDialog.close());

fabEl.addEventListener('click', () => {
  if (!isVaultUnlocked()) {
    showVaultUnlock();
    return;
  }
  openEditor();
});

searchEl.addEventListener('input', renderList);

listEl.addEventListener('change', (e) => {
  const sel = e.target.closest('.speed-select');
  if (!sel) return;
  e.stopPropagation();
  const lang = sel.dataset.lang;
  const rate = parseFloat(sel.value);
  if (!Number.isFinite(rate)) return;
  playbackSpeedByLang[lang] = rate;
  if (inlinePlayingKey === playKey(sel.closest('.card')?.dataset.id, lang)) {
    applySpeedToInlineAudio(lang);
  }
});

async function toggleFav(id, collectionId) {
  if (!collectionId) return;
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return;

  const entry = normalizeEntry({ ...entries[idx] });
  const set = new Set(entry.collections || []);
  const isActive = !set.has(collectionId);
  if (isActive) set.add(collectionId);
  else set.delete(collectionId);
  entry.collections = Array.from(set);
  entry.updatedAt = Date.now();
  entries[idx] = entry;

  await putEntry(toStoredEntry(entry));

  const card = listEl.querySelector(`[data-id="${id}"]`);
  if (!card) return;

  const btn = card.querySelector(`.fav-btn[data-collection="${cssEscape(collectionId)}"]`);
  if (btn) {
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  }

  if (currentFilter === collectionId && !isActive) {
    card.classList.add('card--removing');
    setTimeout(() => {
      card.remove();
      const remaining = listEl.querySelectorAll('.card:not(.card--removing)');
      emptyEl.classList.toggle('hidden', remaining.length > 0);
    }, 220);
  }
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(value);
  }
  return String(value).replace(/["\\\]]/g, '\\$&');
}

sortSelectEl?.addEventListener('change', () => {
  currentSort = sortSelectEl.value;
  renderList();
});

// ===== Filter tabs (dynamic) =====

function renderFilterTabs() {
  if (!filterTabsEl) return;
  const tabs = [];
  tabs.push(
    `<button type="button" class="filter-tab${currentFilter === 'all' ? ' active' : ''}"
      data-filter="all" role="tab" aria-selected="${currentFilter === 'all'}">All</button>`
  );

  for (const c of collections) {
    const active = currentFilter === c.id;
    tabs.push(
      `<button type="button" class="filter-tab${active ? ' active' : ''}"
        data-filter="${escapeAttr(c.id)}" role="tab" aria-selected="${active}"
        title="Long-press to edit">${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</button>`
    );
  }

  tabs.push(
    `<button type="button" class="filter-tab filter-tab--add" data-action="add-collection"
      aria-label="Add new collection" title="Add new collection">+</button>`
  );

  filterTabsEl.innerHTML = tabs.join('');
  attachLongPressToTabs();
}

filterTabsEl?.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-action="add-collection"]');
  if (addBtn) {
    openCollectionEditor(null);
    return;
  }
  const tab = e.target.closest('.filter-tab');
  if (!tab || tab.dataset.action) return;
  const next = tab.dataset.filter;
  if (next === currentFilter) return;
  currentFilter = next;
  filterTabsEl.querySelectorAll('.filter-tab').forEach((t) => {
    const isActive = t.dataset.filter === currentFilter;
    t.classList.toggle('active', isActive);
    if (!t.dataset.action) t.setAttribute('aria-selected', String(isActive));
  });
  renderList();
});

function attachLongPressToTabs() {
  filterTabsEl.querySelectorAll('.filter-tab').forEach((tab) => {
    if (tab.dataset.action) return; // skip "+" button
    if (tab.dataset.filter === 'all') return; // skip "All"
    attachLongPress(tab, () => openCollectionEditor(tab.dataset.filter));
    tab.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openCollectionEditor(tab.dataset.filter);
    });
  });
}

function attachLongPress(el, handler, duration = 550) {
  let timer = null;
  let triggered = false;
  let startX = 0;
  let startY = 0;

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  el.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    triggered = false;
    startX = e.clientX;
    startY = e.clientY;
    cancel();
    timer = setTimeout(() => {
      triggered = true;
      handler(e);
    }, duration);
  });
  el.addEventListener('pointermove', (e) => {
    if (!timer) return;
    if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
      cancel();
    }
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
    el.addEventListener(evt, cancel);
  });
  el.addEventListener('click', (e) => {
    if (triggered) {
      e.preventDefault();
      e.stopPropagation();
      triggered = false;
    }
  });
}

// ===== Collection editor dialog =====

function renderEmojiSuggestions() {
  if (!emojiSuggestionsEl) return;
  emojiSuggestionsEl.innerHTML = SUGGESTED_EMOJIS.map(
    (e) =>
      `<button type="button" class="emoji-chip" data-emoji="${escapeAttr(e)}"
        aria-label="Use ${escapeAttr(e)}">${escapeHtml(e)}</button>`
  ).join('');
}

emojiSuggestionsEl?.addEventListener('click', (e) => {
  const chip = e.target.closest('.emoji-chip');
  if (!chip) return;
  collectionEmojiInput.value = chip.dataset.emoji || '';
  collectionEmojiInput.focus();
});

function openCollectionEditor(id) {
  editingCollectionId = id;
  renderEmojiSuggestions();
  if (id) {
    const c = collections.find((x) => x.id === id);
    if (!c) return;
    collectionEditorTitle.textContent = 'Edit collection';
    collectionEmojiInput.value = c.emoji;
    collectionNameInput.value = c.name;
    collectionDeleteBtn.classList.remove('hidden');
  } else {
    collectionEditorTitle.textContent = 'New collection';
    collectionEmojiInput.value = '⭐';
    collectionNameInput.value = '';
    collectionDeleteBtn.classList.add('hidden');
  }
  collectionEditorDialog.showModal();
  setTimeout(() => collectionNameInput.focus(), 50);
}

collectionCancelBtn?.addEventListener('click', () => collectionEditorDialog.close());

collectionEditorDialog?.addEventListener('close', () => {
  editingCollectionId = null;
});

collectionForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = collectionNameInput.value.trim();
  const emoji = (collectionEmojiInput.value || '').trim() || '⭐';
  if (!name) {
    alert('Please enter a name');
    return;
  }

  let next;
  if (editingCollectionId) {
    next = collections.map((c) =>
      c.id === editingCollectionId ? { ...c, name, emoji } : c
    );
  } else {
    next = [
      ...collections,
      { id: newCollectionId(), name, emoji, createdAt: Date.now() },
    ];
  }
  collections = await saveCollections(next);
  collectionEditorDialog.close();
  renderFilterTabs();
  renderList();
});

collectionDeleteBtn?.addEventListener('click', async () => {
  if (!editingCollectionId) return;
  const target = collections.find((c) => c.id === editingCollectionId);
  if (!target) return;
  if (
    !confirm(
      `Delete collection "${target.emoji} ${target.name}"? Entries will no longer appear under it.`
    )
  ) {
    return;
  }
  const next = collections.filter((c) => c.id !== editingCollectionId);
  collections = await saveCollections(next);

  // Lazy cleanup: also strip this collection id from in-memory entries so the
  // active filter doesn't get stuck. Persisted entries keep the id (harmless,
  // since unknown ids are simply hidden); this avoids a big write storm.
  for (const e of entries) {
    if (Array.isArray(e.collections) && e.collections.includes(editingCollectionId)) {
      e.collections = e.collections.filter((id) => id !== editingCollectionId);
    }
  }
  if (currentFilter === editingCollectionId) currentFilter = 'all';

  collectionEditorDialog.close();
  renderFilterTabs();
  renderList();
});

function isSubstantiveEntry(raw) {
  return isImportableEntry(raw);
}

/** Remove entries with no text and no audio (often leftover from sync or old bugs). */
async function pruneEmptyEntries() {
  const raw = await getAllEntries();
  for (const e of raw) {
    if (e && !isMetaId(e.id) && !isSubstantiveEntry(e)) {
      await deleteEntry(e.id);
    }
  }
}

async function loadEntries() {
  const raw = await getAllEntries();
  entries = raw
    .filter((e) => e && !isMetaId(e.id))
    .filter(isSubstantiveEntry)
    .map(normalizeEntry);
  renderList();
}

const WELCOME_SEED_URL = './welcome-seed.json';
const welcomeSeededKey = (vaultId) => `puppy-book:welcome-seeded:${vaultId}`;

let welcomeSeedCache = null;

async function loadWelcomeSeed() {
  if (welcomeSeedCache) return welcomeSeedCache;
  const res = await fetch(WELCOME_SEED_URL);
  if (!res.ok) throw new Error(`Could not load ${WELCOME_SEED_URL}`);
  welcomeSeedCache = await res.json();
  return welcomeSeedCache;
}

/** First visit to an empty vault: import bundled sample entries (with audio). */
async function maybeSeedWelcomeEntry() {
  const vaultId = getVaultId();
  if (!vaultId) return;

  try {
    if (localStorage.getItem(welcomeSeededKey(vaultId)) === '1') return;
  } catch {}

  const raw = await getAllEntries();
  const existing = raw.filter((e) => e && !isMetaId(e.id) && isSubstantiveEntry(e));
  if (existing.length > 0) return;

  try {
    const seed = await loadWelcomeSeed();
    const items = seed.entries || seed;
    if (!Array.isArray(items) || items.length === 0) return;

    for (const item of items) {
      if (!item?.id) continue;
      await putEntry(
        toStoredEntry(
          normalizeEntry({
            ...item,
            createdAt: item.createdAt ?? Date.now(),
            updatedAt: item.updatedAt ?? Date.now(),
          })
        )
      );
    }

    if (Array.isArray(seed.collections) && seed.collections.length > 0) {
      await saveCollections(seed.collections);
    }
    if (Array.isArray(seed.languages) && seed.languages.length >= 2) {
      await saveLanguages(seed.languages);
    }

    try {
      localStorage.setItem(welcomeSeededKey(vaultId), '1');
    } catch {}
    await reloadLanguages();
    applyLanguageLabels();
    await reloadCollections();
    await loadEntries();
  } catch (err) {
    console.warn('Welcome seed skipped:', err);
  }
}

async function reloadCollections() {
  collections = await loadCollections();
  renderFilterTabs();
}

exportBtn.addEventListener('click', async () => {
  const raw = await getAllEntries();
  const all = raw
    .filter((e) => e && !isMetaId(e.id))
    .filter(isSubstantiveEntry)
    .map((e) => toStoredEntry(normalizeEntry(e)));
  const metas = raw.filter((e) => e && isMetaId(e.id));
  const colMeta = metas.find((e) => Array.isArray(e.collections));
  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    entries: all,
    collections: colMeta?.collections || collections,
    languages: getLanguagesExport(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `puppy-book-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

function isImportableEntry(raw) {
  if (!raw || isMetaId(raw.id)) return false;
  const e = normalizeEntry(raw);
  if (!e.id) return false;
  const hasText = (e.deText || '').trim() || (e.zhText || '').trim();
  const hasDe = !!e.deAudioBase64;
  const hasZh = !!e.zhAudioBase64;
  return hasText || hasDe || hasZh;
}

importFile.addEventListener('change', async () => {
  const file = importFile.files?.[0];
  importFile.value = '';
  if (!file) return;

  try {
    const data = JSON.parse(await file.text());
    const items = data.entries || data;
    if (!Array.isArray(items) || items.length === 0) {
      alert('Invalid backup file format');
      return;
    }
    if (
      !confirm(
        `Import ${items.length} entries (merged with existing data; same IDs will be overwritten). Continue?`
      )
    ) {
      return;
    }
    let count = 0;
    for (const raw of items) {
      if (!isImportableEntry(raw)) continue;
      await putEntry(toStoredEntry(normalizeEntry(raw)));
      count++;
    }
    if (Array.isArray(data.collections) && data.collections.length > 0) {
      collections = await saveCollections(data.collections);
      renderFilterTabs();
    }
    if (Array.isArray(data.languages) && data.languages.length >= 2) {
      await saveLanguages(data.languages);
      applyLanguageLabels();
    }
    await loadEntries();
    alert(`Import complete: ${count} entries`);
  } catch (err) {
    console.error(err);
    alert('Import failed: ' + err.message);
  }
});

// ===== Language labels (per vault) =====

function openLanguagesEditor() {
  const [l1, l2] = getLanguages();
  lang1LabelInput.value = l1.label;
  lang1TagInput.value =
    l1.label === 'Language 1' && l1.tag === 'L1' ? '' : l1.tag;
  lang2LabelInput.value = l2.label;
  lang2TagInput.value =
    l2.label === 'Language 2' && l2.tag === 'L2' ? '' : l2.tag;
  languagesEditorDialog.showModal();
  lang1LabelInput.focus();
}

languagesSettingsBtn?.addEventListener('click', () => {
  if (!isVaultUnlocked()) return;
  openLanguagesEditor();
});

languagesCancelBtn?.addEventListener('click', () => languagesEditorDialog.close());

languagesForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await saveLanguages([
      { label: lang1LabelInput.value, tag: lang1TagInput.value },
      { label: lang2LabelInput.value, tag: lang2TagInput.value },
    ]);
    applyLanguageLabels();
    renderList();
    languagesEditorDialog.close();
  } catch (err) {
    alert(err.message || 'Could not save');
  }
});

// ===== Vault (dual-password unlock) =====

let appConfig = null;

function setAppLocked(locked) {
  document.body.classList.toggle('app-locked', locked);
}

function showVaultError(msg) {
  if (!vaultErrorEl) return;
  if (msg) {
    vaultErrorEl.textContent = msg;
    vaultErrorEl.classList.remove('hidden');
  } else {
    vaultErrorEl.textContent = '';
    vaultErrorEl.classList.add('hidden');
  }
}

function showVaultUnlock() {
  if (!vaultUnlockDialog) return;
  vaultPass1.value = '';
  vaultPass2.value = '';
  showVaultError('');
  setAppLocked(true);
  vaultUnlockDialog.showModal();
  setTimeout(() => vaultPass1.focus(), 50);
}

vaultUnlockDialog?.addEventListener('cancel', (e) => e.preventDefault());

vaultForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showVaultError('');
  try {
    const vaultId = await deriveVaultId(vaultPass1.value, vaultPass2.value);
    if (vaultRemember?.checked) {
      writeRememberedVaultId(vaultId);
    } else {
      clearRememberedVaultId();
    }
    await activateVault(vaultId);
    vaultUnlockDialog.close();
  } catch (err) {
    showVaultError(err.message || 'Could not open. Check both passwords.');
  }
});

lockVaultBtn?.addEventListener('click', () => {
  lockVault();
});

async function activateVault(vaultId) {
  setVaultId(vaultId);
  setAppLocked(false);

  await initSync(vaultId);
  updateSyncStatus();

  if (isEnabled() && getSyncStatus().ready) {
    await maybeUploadLocalToCloud();
  }

  await reloadLanguages();
  applyLanguageLabels();
  await reloadCollections();
  await pruneEmptyEntries();
  await loadEntries();
  await maybeSeedWelcomeEntry();
}

function lockVault() {
  stopInlinePlayback();
  clearVaultId();
  clearSync();
  setAppLocked(true);
  entries = [];
  collections = [];
  resetLanguagesMemory();
  renderFilterTabs();
  renderList();
  showVaultUnlock();
  updateSyncStatus();
}

function updateSyncStatus() {
  if (!syncStatusEl) return;
  if (!isVaultUnlocked()) {
    syncStatusEl.textContent = 'Enter both passwords to open';
    syncStatusEl.className = 'sync-status sync-status--local';
    return;
  }
  const s = getSyncStatus();
  if (!s.enabled) {
    syncStatusEl.textContent = 'Local only — add cloud config to sync with a partner';
    syncStatusEl.className = 'sync-status sync-status--local';
    return;
  }
  if (!s.ready) {
    syncStatusEl.textContent = s.error
      ? `Cloud sync error: ${s.error}`
      : 'Cloud not connected';
    syncStatusEl.className = 'sync-status sync-status--error';
    return;
  }
  syncStatusEl.textContent = 'Unlocked — sharing with partners who use the same passwords';
  syncStatusEl.className = 'sync-status sync-status--ok';
}

async function maybeUploadLocalToCloud() {
  const cloudEntries = await getAllCloudEntries();
  if (cloudEntries.length > 0) return;
  const localAll = await getAllEntriesLocal();
  const localEntries = localAll.filter((e) => !isMetaId(e.id));
  const localMetas = localAll.filter((e) => e && isMetaId(e.id));
  if (localEntries.length === 0 && localMetas.length === 0) return;
  if (
    !confirm(
      `Upload ${localEntries.length} local entries to the cloud for this password space?`
    )
  ) {
    return;
  }
  for (const raw of localEntries) {
    await putCloudEntry(raw);
  }
  for (const meta of localMetas) {
    await putCloudEntry(meta);
  }
}

function applyLanguageLabels() {
  const [l1, l2] = getLanguages();

  const subtitle = document.querySelector('.subtitle');
  if (subtitle) {
    const generic =
      l1.label === 'Language 1' &&
      l2.label === 'Language 2' &&
      l1.tag === 'L1' &&
      l2.tag === 'L2';
    subtitle.textContent = generic
      ? 'A notebook for practicing pronunciation together in two languages.'
      : `Practice pronunciation in ${l1.label} and ${l2.label}.`;
  }

  if (searchEl) {
    searchEl.placeholder = `Search ${l1.label} or ${l2.label}…`;
  }

  if (sortSelectEl) {
    const cur = sortSelectEl.value;
    sortSelectEl.innerHTML = `
      <option value="time-desc">Newest first</option>
      <option value="time-asc">Oldest first</option>
      <option value="de-asc">${escapeHtml(l1.tag)}: short → long</option>
      <option value="de-desc">${escapeHtml(l1.tag)}: long → short</option>
      <option value="zh-asc">${escapeHtml(l2.tag)}: short → long</option>
      <option value="zh-desc">${escapeHtml(l2.tag)}: long → short</option>`;
    if ([...sortSelectEl.options].some((o) => o.value === cur)) {
      sortSelectEl.value = cur;
    }
  }

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('lang1-legend', l1.label);
  setText('lang1-text-label', `${l1.label} text`);
  setText('lang1-audio-label', `${l1.label} audio`);
  setText('clear-de-audio', `Clear ${l1.label} audio`);

  setText('lang2-legend', l2.label);
  setText('lang2-text-label', `${l2.label} text`);
  setText('lang2-audio-label', `${l2.label} audio`);
  setText('clear-zh-audio', `Clear ${l2.label} audio`);

  const tag1 = document.getElementById('detail-tag-lang1');
  const tag2 = document.getElementById('detail-tag-lang2');
  if (tag1) {
    tag1.textContent = l1.tag;
    tag1.className = `lang-tag lang-tag--${l1.css}`;
  }
  if (tag2) {
    tag2.textContent = l2.tag;
    tag2.className = `lang-tag lang-tag--${l2.css}`;
  }

  deRecordBtn.className = `btn-record btn-record--${l1.css}`;
  zhRecordBtn.className = `btn-record btn-record--${l2.css}`;
}

async function bootstrap() {
  appConfig = await loadConfig();
  resetLanguagesMemory();

  onEntriesChanged(async () => {
    if (!isVaultUnlocked()) return;
    await reloadLanguages();
    applyLanguageLabels();
    await reloadCollections();
    await loadEntries();
  });

  updateSyncStatus();

  const remembered = readRememberedVaultId();
  if (remembered) {
    try {
      await activateVault(remembered);
      return;
    } catch (err) {
      console.warn('Remembered vault failed:', err);
      clearRememberedVaultId();
    }
  }

  showVaultUnlock();
}

bootstrap();
