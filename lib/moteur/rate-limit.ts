import 'server-only';

/**
 * Rate limit simple en mémoire : 60 req/min par clé (childId ou IP).
 *
 * TODO : remplacer par Upstash Redis en prod (déploiement multi-instances).
 * Pour l'instant, la map vit dans l'instance Edge — suffisant à petite échelle.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const LIMIT = 60;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec?: number;
}

export function checkRateLimit(key: string, limit = LIMIT): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
    };
  }
  b.count += 1;
  return { ok: true, remaining: limit - b.count };
}

/**
 * Construit une clé de rate-limit : préfère childId si dispo, sinon IP.
 */
export function rateLimitKey(childId: string | null, ip: string | null, route: string): string {
  const id = childId || ip || 'anon';
  return `${route}:${id}`;
}
