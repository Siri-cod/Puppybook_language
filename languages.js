import { getEntry, putEntry } from './db.js';
import { getVaultId } from './vault.js';

/** Internal storage slots (maps to deText/zhText fields for backward compatibility). */
export const SLOTS = { L1: 'de', L2: 'zh' };

export const LANGUAGES_META_PREFIX = '__meta:languages:';

const DEFAULT_LANGS = [
  { slot: SLOTS.L1, label: 'Language 1', tag: 'L1', css: 'lang1' },
  { slot: SLOTS.L2, label: 'Language 2', tag: 'L2', css: 'lang2' },
];

/** @type {typeof DEFAULT_LANGS} */
let languages = DEFAULT_LANGS.map((l) => ({ ...l }));

export function languagesMetaId(vaultId) {
  return `${LANGUAGES_META_PREFIX}${vaultId || ''}`;
}

export function isLanguagesMetaId(id) {
  return typeof id === 'string' && id.startsWith(LANGUAGES_META_PREFIX);
}

function deriveTag(label, fallback) {
  const t = String(label || '').trim();
  if (!t) return fallback;
  const words = t.match(/[A-Za-zÀ-ÿ]+/g);
  if (words?.length) {
    const initials = words.map((w) => w[0]).join('').toUpperCase();
    return (initials || fallback).slice(0, 8);
  }
  return t.slice(0, 2) || fallback;
}

export function normalizeLanguageInput(raw, index) {
  const fallbackLabel = index === 0 ? 'Language 1' : 'Language 2';
  const fallbackTag = index === 0 ? 'L1' : 'L2';
  const label = String(raw?.label ?? fallbackLabel).trim() || fallbackLabel;
  let tag = String(raw?.tag ?? '').trim().slice(0, 8);
  if (!tag) tag = deriveTag(label, fallbackTag);
  return { label, tag };
}

function toRuntimeLang({ label, tag }, index) {
  return {
    slot: index === 0 ? SLOTS.L1 : SLOTS.L2,
    label,
    tag,
    css: index === 0 ? 'lang1' : 'lang2',
  };
}

export function resetLanguagesMemory() {
  languages = DEFAULT_LANGS.map((l) => ({ ...l }));
  return languages;
}

/** @returns {Promise<typeof DEFAULT_LANGS>} */
export async function reloadLanguages() {
  const vaultId = getVaultId();
  if (!vaultId) {
    return resetLanguagesMemory();
  }

  try {
    const meta = await getEntry(languagesMetaId(vaultId));
    if (meta && Array.isArray(meta.languages) && meta.languages.length >= 2) {
      languages = [
        toRuntimeLang(normalizeLanguageInput(meta.languages[0], 0), 0),
        toRuntimeLang(normalizeLanguageInput(meta.languages[1], 1), 1),
      ];
      return languages;
    }
  } catch (err) {
    console.warn('Failed to load language labels:', err);
  }

  languages = DEFAULT_LANGS.map((l) => ({ ...l }));
  return languages;
}

/** @param {Array<{label?:string,tag?:string}>} list */
export async function saveLanguages(list) {
  const vaultId = getVaultId();
  if (!vaultId) throw new Error('Vault locked');

  const normalized = [
    normalizeLanguageInput(list[0], 0),
    normalizeLanguageInput(list[1], 1),
  ];
  const meta = {
    id: languagesMetaId(vaultId),
    vaultId,
    languages: normalized,
    updatedAt: Date.now(),
  };
  await putEntry(meta);
  languages = [
    toRuntimeLang(normalized[0], 0),
    toRuntimeLang(normalized[1], 1),
  ];
  return languages;
}

export function getLanguages() {
  return languages;
}

/** For export backup JSON */
export function getLanguagesExport() {
  return languages.map(({ label, tag }) => ({ label, tag }));
}

export function langBySlot(slot) {
  return languages.find((l) => l.slot === slot) || languages[0];
}

export function langLabel(slot) {
  return langBySlot(slot).label;
}

export function langTag(slot) {
  return langBySlot(slot).tag;
}

export function langCss(slot) {
  return langBySlot(slot).css;
}

export function isSecondSlot(slot) {
  return slot === SLOTS.L2;
}
