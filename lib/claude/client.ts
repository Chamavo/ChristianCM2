import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Modèles Claude utilisés.
 *  - DEFAULT (Haiku) : validations rédigées courtes, reformulations.
 *  - COMPLEX (Sonnet) : décomposition générée, validation rédigé libre,
 *    feedback quiz (analyse multi-exo, ton Dumbledore élaboré).
 */
export const CLAUDE_MODELS = {
  DEFAULT: 'claude-haiku-4-5-20251001',
  COMPLEX: 'claude-sonnet-4-6',
} as const;

let _client: Anthropic | null = null;

/**
 * Singleton du SDK Anthropic.
 * Lève une erreur claire si la clé API n'est pas définie.
 */
export function getAnthropicClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Variable d'environnement ANTHROPIC_API_KEY manquante (cf. .env.example)."
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

/** Nombre total de tokens consommés par une réponse (input + output). */
export function totalTokens(usage: Anthropic.Messages.Usage | undefined): number {
  if (!usage) return 0;
  return (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0);
}

/**
 * Extrait proprement le texte d'une réponse Claude (concatène les blocs `text`).
 */
export function extractText(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

/**
 * Tente de parser un objet JSON depuis une réponse texte de Claude.
 * Gère les cas où Claude entoure le JSON de markdown (```json ... ```).
 */
export function parseJsonFromClaude<T = unknown>(text: string): T | null {
  // Nettoyer les balises markdown
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Fallback : trouver le premier {...} ou [...] dans la chaîne
    const match = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
