import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { waitForAppReady } from '../helpers/setup.js';
import { navigateTo, verifyActiveView, dismissAlert } from '../helpers/interactions.js';

describe('CUJ: Data Management (CSV Export)', () => {
  let tempExportAll: string;
  let tempExportRange: string;

  before(async () => {
    await waitForAppReady();
    const exportBaseDir = process.env.SPEC_STAGE_DIR || os.tmpdir();
    tempExportAll = path.join(exportBaseDir, `kechimochi_full_${Date.now()}.csv`);
    tempExportRange = path.join(exportBaseDir, `kechimochi_range_${Date.now()}.csv`);
  });

  after(() => {
    // Only cleanup if we are NOT in a staging environment (where we want to capture artifacts)
    if (!process.env.SPEC_STAGE_DIR) {
        if (fs.existsSync(tempExportAll)) fs.unlinkSync(tempExportAll);
        if (fs.existsSync(tempExportRange)) fs.unlinkSync(tempExportRange);
    }
  });

  // Reusable helper to apply the mock with the newly added app hooks
  async function applyDialogMock(savePath: string) {
    await browser.execute((p) => {
        (window as any).mockSavePath = p;
        (window as any).mockOpenPath = p; // If needed for imports
    }, savePath);
  }

  it('should export all history and verify file contents', async () => {
    await navigateTo('profile');
    expect(await verifyActiveView('profile')).toBe(true);

    await applyDialogMock(tempExportAll);

    const exportBtn = await $('#profile-btn-export-csv');
    await exportBtn.click();

    // Export modal: select "All History"
    const radioAll = await $('input[name="export-mode"][value="all"]');
    await radioAll.waitForDisplayed();
    await radioAll.click();

    const confirmBtn = await $('#export-confirm');
    await confirmBtn.click();

    // Wait for the file to be written. The app calls exportCsv(savePath).
    await browser.waitUntil(() => fs.existsSync(tempExportAll), {
        timeout: 15000,
        timeoutMsg: 'Export file was not created within 15s'
    });

    // Dismiss the success alert
    await dismissAlert();

    // Verify file exists
    expect(fs.existsSync(tempExportAll)).toBe(true);
    
    // Verify file contains expected data (header at least)
    const content = fs.readFileSync(tempExportAll, 'utf-8');
    expect(content).toContain('Date,Log Name,Media Type,Duration,Language');
    // From fixtures/seed.ts, there should be some entries like '呪術廻戦' or '薬屋のひとりごと'
    expect(content).toContain('呪術廻戦');
    expect(content.split('\n').length).toBeGreaterThan(10); 
  });

  it('should export custom range and verify difference', async () => {
    // Navigate to profile if not there
    if (!(await verifyActiveView('profile'))) {
        await navigateTo('profile');
    }

    // Update mock path for next export
    await applyDialogMock(tempExportRange);

    const exportBtn = await $('#profile-btn-export-csv');
    // Use JS click if regular click is intercepted
    try {
        await exportBtn.click();
    } catch (e) {
        await browser.execute((el: any) => el.click(), exportBtn);
    }

    // Export modal: select "Date Range"
    const radioRange = await $('input[name="export-mode"][value="range"]');
    await radioRange.waitForDisplayed();
    await radioRange.click();

    const confirmBtn = await $('#export-confirm');
    await confirmBtn.click();

    await browser.waitUntil(() => fs.existsSync(tempExportRange), {
        timeout: 15000,
        timeoutMsg: 'Range export file was not created within 15s'
    });

    // Dismiss the success alert
    await dismissAlert();

    expect(fs.existsSync(tempExportRange)).toBe(true);
    const fullContent = fs.readFileSync(tempExportAll, 'utf-8');
    const rangeContent = fs.readFileSync(tempExportRange, 'utf-8');

    // Range should be different from full (shorter)
    expect(fullContent).not.toBe(rangeContent);
    expect(fullContent.length).toBeGreaterThan(rangeContent.length);
  });
});
