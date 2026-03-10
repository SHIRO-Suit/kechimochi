import { waitForAppReady } from '../helpers/setup.js';
import { navigateTo, verifyActiveView } from '../helpers/interactions.js';

describe('Media Management CUJs', () => {
  before(async () => {
    await waitForAppReady();
  });

  describe('CUJ: Add and Manage Media', () => {
    it('should add "Cyberpunk 2077" and verify it in the grid', async () => {
      await navigateTo('media');
      
      const addMediaBtn = await $('#btn-add-media-grid');
      await addMediaBtn.click();

      const titleInput = await $('#add-media-title');
      await titleInput.setValue('Cyberpunk 2077');

      const typeSelect = await $('#add-media-type');
      await typeSelect.selectByVisibleText('Playing');

      const confirmBtn = await $('#add-media-confirm');
      await confirmBtn.click();

      // Verify it navigates to detail view automatically
      const detailTitle = await $('#media-title');
      await detailTitle.waitForExist({ timeout: 5000 });
      expect(await detailTitle.getText()).toBe('Cyberpunk 2077');

      // Navigate back to grid to verify it's there
      const backBtn = await $('#btn-back-grid');
      await backBtn.click();

      // Verify it appears in the grid
      const gridItem = await $(`//div[contains(@class, "media-item-wrapper")]//div[contains(text(), "Cyberpunk 2077")]`);
      await gridItem.waitForExist({ timeout: 5000 });
      expect(await gridItem.isDisplayed()).toBe(true);
    });

    it('should update status in detail view and verify it in the grid', async () => {
      const gridItem = await $(`//div[contains(@class, "media-item-wrapper")]//div[contains(text(), "Cyberpunk 2077")]`);
      await gridItem.click();

      const statusSelect = await $('#media-tracking-status');
      await statusSelect.waitForExist();
      await statusSelect.selectByVisibleText('Ongoing');
      
      // wait for save
      await browser.pause(500);

      const backBtn = await $('#btn-back-grid');
      await backBtn.click();

      // Verify status label (LED) on the card
      const statusLabel = await $(`//div[contains(text(), "Cyberpunk 2077")]/ancestor::div[contains(@class, "media-item-wrapper")]//*[contains(@class, "status-ongoing")]`);
      expect(await statusLabel.isExisting()).toBe(true);
    });
  });

  describe('CUJ: Media Exploration from Dashboard', () => {
    it('should navigate to media detail from dashboard activity link', async () => {
      // First ensure there is at least one activity. We'll add one quickly.
      await navigateTo('dashboard');
      const addActivityBtn = await $('#btn-add-activity');
      await addActivityBtn.click();

      await $('#activity-media').setValue('Cyberpunk 2077');
      await $('#activity-duration').setValue('30');
      
      const activeDate = await $('.calendar-day.active');
      if (await activeDate.isExisting()) await activeDate.click();

      await $('#add-activity-form button[type="submit"]').click();
      await browser.pause(1000);

      // Now find the link on dashboard
      const mediaLink = await $('.dashboard-media-link');
      await mediaLink.waitForExist();
      const linkText = await mediaLink.getText();
      expect(linkText).toBe('Cyberpunk 2077');
      
      await mediaLink.click();

      // Verify it navigated to media detail
      await $('#media-title').waitForExist();
      const detailTitle = await $('#media-title').getText();
      expect(detailTitle).toBe('Cyberpunk 2077');
      
      expect(await verifyActiveView('media')).toBe(true);
    });
  });
});
