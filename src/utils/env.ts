export const BASE_URL = process.env.BASE_URL || 'https://6valley-testing.6amdev.xyz';
export const HEADLESS = process.env.HEADLESS !== 'false';
export const DEFAULT_TIMEOUT_MS = Number(process.env.DEFAULT_TIMEOUT_MS ?? 60_000);

export function asEscapedUrlPattern(url: string): RegExp {
  return new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}/?$`);
}
