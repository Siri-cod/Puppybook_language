import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

/** @type {{ supabaseUrl: string, supabaseAnonKey: string, notebookId?: string, notebooks?: Array<{id:string,label?:string}> } | null} */
let config = null;
/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;
let ready = false;
let initError = null;
/** Currently active notebook id (the one the UI is talking to). */
let activeNotebookId = null;
/** @type {(() => void) | null} */
let changeHandler = null;
/** @type {import('@supabase/supabase-js').RealtimeChannel | null} */
let activeChannel = null;

/** Strip /rest/v1 and trailing slashes — SDK adds the API path itself */
function normalizeSupabaseUrl(url) {
  let u = String(url || '').trim();
  if (!u) return '';
  u = u.replace(/\/rest\/v1\/?$/i, '');
  u = u.replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(u)) return '';
  return u;
}

export function isEnabled() {
  return !!config && !!client;
}

export function getSyncStatus() {
  return {
    enabled: !!config,
    ready,
    error: initError,
    notebookId: activeNotebookId,
  };
}

export function getNotebookId() {
  return activeNotebookId;
}

/** Load config.js once. Returns null if missing/invalid. */
export async function loadConfig() {
  if (config) return config;
  try {
    const mod = await import('./config.js');
    config = mod.default || null;
  } catch {
    config = null;
  }
  return config;
}

/**
 * Initialize cloud sync against a specific notebook id.
 * @param {string|null} [notebookIdOverride] - takes precedence over config.notebookId
 */
export async function initSync(notebookIdOverride = null) {
  ready = false;
  initError = null;
  client = null;
  activeChannel = null;

  const cfg = await loadConfig();
  if (!cfg) return; // no config.js -> stay in local-only mode silently

  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    initError = 'config.js is incomplete';
    return;
  }

  const nbId = (notebookIdOverride || cfg.notebookId || '').trim();
  if (!nbId) {
    initError = 'No group selected';
    return;
  }

  const supabaseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  if (!supabaseUrl) {
    initError = 'Invalid supabaseUrl in config.js';
    return;
  }

  try {
    client = createClient(supabaseUrl, cfg.supabaseAnonKey);
    activeNotebookId = nbId;
    const { error } = await client
      .from('entries')
      .select('id')
      .eq('notebook_id', nbId)
      .limit(1);
    if (error) throw error;
    ready = true;
    initError = null;
    subscribeChanges();
  } catch (err) {
    initError = err.message || String(err);
    ready = false;
    client = null;
  }
}

function subscribeChanges() {
  if (!client || !activeNotebookId) return;
  if (activeChannel) {
    try { activeChannel.unsubscribe(); } catch {}
    activeChannel = null;
  }
  activeChannel = client
    .channel(`entries-${activeNotebookId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'entries',
        filter: `notebook_id=eq.${activeNotebookId}`,
      },
      () => changeHandler?.()
    )
    .subscribe();
}

export function onEntriesChanged(handler) {
  changeHandler = handler;
}

/** Tear down cloud client (e.g. when locking the vault). */
export function clearSync() {
  ready = false;
  initError = null;
  activeNotebookId = null;
  if (activeChannel) {
    try {
      activeChannel.unsubscribe();
    } catch {}
    activeChannel = null;
  }
  client = null;
}

/** @returns {Promise<object[]>} */
export async function getAllEntries() {
  if (!client || !activeNotebookId) throw new Error('Cloud sync not ready');
  const { data, error } = await client
    .from('entries')
    .select('data, updated_at')
    .eq('notebook_id', activeNotebookId);
  if (error) throw error;
  const list = (data || []).map((row) => row.data);
  list.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return list;
}

/** @param {string} id */
export async function getEntry(id) {
  if (!client || !activeNotebookId) throw new Error('Cloud sync not ready');
  const { data, error } = await client
    .from('entries')
    .select('data')
    .eq('notebook_id', activeNotebookId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

/** @param {object} entry */
export async function putEntry(entry) {
  if (!client || !activeNotebookId) throw new Error('Cloud sync not ready');
  const { error } = await client.from('entries').upsert({
    id: entry.id,
    notebook_id: activeNotebookId,
    data: entry,
    updated_at: entry.updatedAt ?? Date.now(),
  });
  if (error) throw error;
  return entry;
}

/** @param {string} id */
export async function deleteEntry(id) {
  if (!client || !activeNotebookId) throw new Error('Cloud sync not ready');
  const { error } = await client
    .from('entries')
    .delete()
    .eq('notebook_id', activeNotebookId)
    .eq('id', id);
  if (error) throw error;
}
