import fs from 'fs';
import path from 'path';

const cache = new Map<string, unknown>();

export function loadFixture<T>(relativePathFromFixtures: string): T {
  const absolutePath = path.resolve(process.cwd(), 'src/fixtures', relativePathFromFixtures);
  const cached = cache.get(absolutePath);
  if (cached) {
    return cached as T;
  }

  const raw = fs.readFileSync(absolutePath, 'utf-8');
  const parsed = JSON.parse(raw) as T;
  cache.set(absolutePath, parsed);
  return parsed;
}
