import { waitForAppReady } from '../helpers/setup.js';
import { navigateTo, verifyActiveView, takeAndCompareScreenshot } from '../helpers/interactions.js';

describe('CUJ: User Personalization', () => {
  before(async () => {
    await waitForAppReady();
  });

  it('should change the theme to Molokai and verify visually', async () => {
    await navigateTo('profile');
    expect(await verifyActiveView('profile')).toBe(true);

    const themeSelect = await $('#profile-select-theme');
    await themeSelect.selectByAttribute('value', 'molokai');

    // Verify attribute change
    const body = await $('body');
    expect(await body.getAttribute('data-theme')).toBe('molokai');

    // Visual verification: check actual colors match visually
    await takeAndCompareScreenshot('profile-molokai-theme');
  });
});
