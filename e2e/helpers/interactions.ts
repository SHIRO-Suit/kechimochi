/**
 * Reusable UI interaction helpers for CUJ specs.
 */

type ViewName = 'dashboard' | 'media' | 'profile';

/**
 * Navigate to a specific view by clicking the nav link.
 */
export async function navigateTo(view: ViewName): Promise<void> {
  const link = await $(`[data-view="${view}"]`);
  await link.click();
  
  // Wait for the view to actually render
  await browser.pause(500);
}

/**
 * Verify that the current view is the expected one by checking the active nav link.
 */
export async function verifyActiveView(view: ViewName): Promise<boolean> {
  const link = await $(`[data-view="${view}"]`);
  const classes = await link.getAttribute('class');
  return classes?.includes('active') ?? false;
}

/**
 * Verify the current view is not in a broken state.
 * Checks that the view container has rendered content and nav links are interactive.
 */
export async function verifyViewNotBroken(): Promise<void> {
  // Check view container has content
  const container = await $('#view-container');
  const html = await container.getHTML();
  expect(html.length).toBeGreaterThan(10);

  // Check all nav links are still displayed and clickable
  const navLinks = await $$('.nav-link');
  for (const link of navLinks) {
    expect(await link.isDisplayed()).toBe(true);
    expect(await link.isClickable()).toBe(true);
  }
}

/**
 * Use OCR to verify text is visible on screen.
 * Falls back to DOM text search if OCR is not available.
 */
export async function assertTextVisible(text: string): Promise<void> {
  try {
    await browser.ocrWaitForTextDisplayed({
      text,
      timeout: 5000,
    });
  } catch {
    // Fallback: search in page text content
    const body = await $('body');
    const bodyText = await body.getText();
    expect(bodyText).toContain(text);
  }
}

/**
 * Take a screenshot and compare against baseline using visual service.
 */
export async function takeAndCompareScreenshot(name: string): Promise<void> {
  await browser.checkScreen(name, {
    // Allow a small tolerance for rendering differences
    misMatchPercentage: 1,
  });
}
