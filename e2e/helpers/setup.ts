/**
 * Test environment setup/teardown helpers.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, '..', 'fixtures');

/**
 * Creates a temporary test directory by copying all fixture data into it.
 * Returns the path to the temp directory ($TEST_DIR).
 */
export function prepareTestDir(): string {
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kechimochi-e2e-'));

  // Copy fixture databases
  for (const file of ['kechimochi_TESTUSER.db', 'kechimochi_shared_media.db']) {
    const src = path.join(FIXTURES_DIR, file);
    const dest = path.join(testDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      throw new Error(`Fixture file not found: ${src}. Did you run 'npm run e2e:seed'?`);
    }
  }

  // Copy covers directory
  const srcCovers = path.join(FIXTURES_DIR, 'covers');
  const destCovers = path.join(testDir, 'covers');
  if (fs.existsSync(srcCovers)) {
    fs.mkdirSync(destCovers, { recursive: true });
    for (const file of fs.readdirSync(srcCovers)) {
      fs.copyFileSync(path.join(srcCovers, file), path.join(destCovers, file));
    }
  }

  return testDir;
}

/**
 * Removes the temporary test directory.
 */
export function cleanupTestDir(testDir: string): void {
  if (testDir && testDir.startsWith(os.tmpdir()) && fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

/**
 * Waits for the app to be ready by polling for a known DOM element.
 */
export async function waitForAppReady(timeout = 15000): Promise<void> {
  console.log(`[e2e] Waiting for app to be ready (timeout: ${timeout}ms)...`);
  let retries = 0;
  await (browser as any).waitUntil(
    async () => {
      retries++;
      const url = await (browser as any).getUrl().catch(() => 'unknown');
      const title = await (browser as any).getTitle().catch(() => 'unknown');
      const el = await $('[data-view="dashboard"]');
      const exists = await el.isExisting();
      const displayed = exists ? await el.isDisplayed() : false;
      
      if (retries % 3 === 0) {
        console.log(`[e2e] App ready check #${retries}: url=${url}, title="${title}", exists=${exists}, displayed=${displayed}`);
      }
      
      if (displayed) {
         console.log('[e2e] App is ready (dashboard view visible)');
      }
      return displayed;
    },
    {
      timeout,
      timeoutMsg: 'App did not become ready within timeout',
      interval: 1000,
    }
  );
}
