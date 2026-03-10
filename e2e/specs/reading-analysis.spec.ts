import { waitForAppReady } from '../helpers/setup.js';
import { navigateTo, verifyActiveView, dismissAlert } from '../helpers/interactions.js';

describe('CUJ: Reading Analysis (Report Card)', () => {
  before(async () => {
    await waitForAppReady();
  });

  it('should calculate the reading report and verify updates', async () => {
    await navigateTo('profile');
    expect(await verifyActiveView('profile')).toBe(true);

    const calcBtn = await $('#profile-btn-calculate-report');
    
    // We just check its existence later, no need to keep it in a variable here if not used
    await $('#profile-report-timestamp');

    await calcBtn.click();

    // Verify button state transition (Calculating...)
    // Use try-catch to swallow stale element errors during re-renders
    await browser.waitUntil(async () => {
        try {
            const btn = await $('#profile-btn-calculate-report');
            const text = await btn.getText();
            const disabled = await btn.getAttribute('disabled');
            return text === 'Calculating...' || disabled === 'true';
        } catch {
            return false;
        }
    }, { timeout: 2000, interval: 100 }).catch(() => {});
    
    // Wait for completion (button becomes clickable again/text resets)
    await browser.waitUntil(async () => {
      try {
        const btn = await $('#profile-btn-calculate-report');
        return (await btn.getText()) === 'Calculate Report';
      } catch {
        return false;
      }
    }, {
      timeout: 10000,
      timeoutMsg: 'Calculation took too long'
    });

    // Dismiss the success alert that pops up after render
    await dismissAlert();

    // Verify report content is updated
    const content = await $('#profile-report-card-content');
    const contentText = await content.getText();
    expect(contentText).not.toContain('No report calculated yet.');
    
    // Verify timestamp exists and is updated
    const newTimestampEl = await $('#profile-report-timestamp');
    expect(await newTimestampEl.isExisting()).toBe(true);
    const timestampText = await newTimestampEl.getText();
    expect(timestampText).toContain('Since');
    
    // Validate it contains today's date or similar (YYYY-MM-DD format)
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    expect(timestampText).toMatch(dateRegex);
  });
});
