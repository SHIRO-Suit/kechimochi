import { waitForAppReady } from '../helpers/setup.js';
import { navigateTo, verifyActiveView } from '../helpers/interactions.js';

describe('CUJ: Log Daily Activity', () => {
  before(async () => {
    await waitForAppReady();
  });

  it('should verify that "Final Fantasy 7" does not exist in the media tab initially', async () => {
    await navigateTo('media');
    expect(await verifyActiveView('media')).toBe(true);

    const gridContainer = await $('#media-grid-container');
    const text = await gridContainer.getText();
    expect(text).not.toContain('Final Fantasy 7');
  });

  it('should log a new activity for "Final Fantasy 7"', async () => {
    const addActivityBtn = await $('#btn-add-activity');
    await addActivityBtn.click();

    const mediaInput = await $('#activity-media');
    await mediaInput.setValue('Final Fantasy 7');

    const durationInput = await $('#activity-duration');
    await durationInput.setValue('60');

    // Select the current date (mocked to 2024-03-31)
    const activeDate = await $('.cal-day[data-date="2024-03-31"]');
    if (await activeDate.isExisting()) {
      await activeDate.click();
    }

    const logBtn = await $('#add-activity-form button[type="submit"]');
    await logBtn.click();

    // Handle the "new media type" prompt
    const promptInput = await $('#prompt-input');
    await promptInput.waitForExist({ timeout: 5000 });
    await promptInput.setValue('Playing');
    
    const confirmBtn = await $('#prompt-confirm');
    await confirmBtn.click();

    // Wait for modal to close and dashboard to refresh
    await $('#add-activity-form').waitForExist({ reverse: true, timeout: 5000 });
    await browser.pause(500);
  });

  it('should verify the new entry in "Recent Activity" on dashboard', async () => {
    await navigateTo('dashboard');
    expect(await verifyActiveView('dashboard')).toBe(true);

    const recentActivity = await $('#recent-logs-list');
    const text = await recentActivity.getText();
    expect(text).toContain('Final Fantasy 7');
    expect(text).toContain('60 minutes');
  });

  it('should verify that "Final Fantasy 7" now exists in the media tab', async () => {
    await navigateTo('media');
    expect(await verifyActiveView('media')).toBe(true);

    const gridContainer = await $('#media-grid-container');
    await gridContainer.waitForExist({ timeout: 5000 });
    
    // Small pause to allow animations to complete and text to become "visible" to the driver
    await browser.pause(500);

    const items = await $$('.media-grid-item');
    const titleTexts = await items.map(t => t.getAttribute('data-title'));
    
    expect(titleTexts).toContain('Final Fantasy 7');
  });
});
