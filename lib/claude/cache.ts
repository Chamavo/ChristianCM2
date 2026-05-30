import 'server-only';
import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cache simple des réponses Claude.
 *
 * Stratégie :
 *  - Si la table Postgres `llm_cache` existe → on l'utilise (persistant, partagé entre instances).
 *  - Sinon → fallback mémoire (Map) à TTL 30j (utile en dev).
 *
 * Schéma SQL attendu (à ajouter au schéma Supabase via migration ultérieure) :
 *   create table public.llm_cache (
 *     prompt_hash text primary key,
 *     response jsonb not null,
 *     model text,
 *     tokens_input int,
 *     tokens_output int,
 *     created_at timestamptz default now()
 *   );
 *   create index idx_llm_cache_created on public.llm_cache(created_at);
 */

const TTL_MS = 30 * 24 * 3600 * 1000;
const TABLE = 'llm_cache';

interface CachedEntry {
  response: unknown;
  model?: string;
  tokens_input?: number;
  tokens_output?: number;
  created_at: number;
}

// Fallback mémoire
const memoryCache = new Map<string, CachedEntry>();

/**
 * Hash stable d'un prompt (SHA-256, base64url tronqué 32 chars).
 */
export function hashPrompt(...parts: string[]): string {
  const h = createHash('sha256');
  for (const p of parts) h.update(p ?? '');
  return h.digest('base64url').slice(0, 32);
}

export interface CacheLookupResult<T> {
  hit: boolean;
  value: T | null;
}

export async function cacheGet<T = unknown>(
  hash: string,
  supabase?: SupabaseClient
): Promise<CacheLookupResult<T>> {
  // Essai Postgres
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('response, created_at')
        .eq('prompt_hash', hash)
        .maybeSingle();
      if (!error && data) {
        const createdAt = new Date(data.created_at).getTime();
        if (Date.now() - createdAt <= TTL_MS) {
          return { hit: true, value: data.response as T };
        }
      }
    } catch {
      // Table non créée ou erreur : fallback mémoire silencieux
    }
  }

  // Fallback mémoire
  const entry = memoryCache.get(hash);
  if (entry && Date.now() - entry.created_at <= TTL_MS) {
    return { hit: true, value: entry.response as T };
  }
  // Expirée
  if (entry) memoryCache.delete(hash);
  return { hit: false, value: null };
}

export async function cacheSet(
  hash: string,
  response: unknown,
  meta: { model?: string; tokens_input?: number; tokens_output?: number } = {},
  supabase?: SupabaseClient
): Promise<void> {
  // Mémoire toujours mise à jour (rapide, sert de fallback)
  memoryCache.set(hash, {
    response,
    ...meta,
    created_at: Date.now(),
  });

  // Postgres si disponible (best-effort, on n'échoue pas si la table n'existe pas)
  if (supabase) {
    try {
      await supabase.from(TABLE).upsert(
        {
          prompt_hash: hash,
          response,
          model: meta.model ?? null,
          tokens_input: meta.tokens_input ?? 0,
          tokens_output: meta.tokens_output ?? 0,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'prompt_hash' }
      );
    } catch {
      // table absente : silencieux, on garde le cache mémoire
    }
  }
}

/**
 * Nettoie le cache mémoire (utile pour les tests).
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
}
