import { waitForAppReady } from '../helpers/setup.js';
import { 
    navigateTo, 
    verifyActiveView, 
    clickMediaItem,
    clickMarkAsComplete,
    getDetailTrackingStatus,
    isArchivedStatusActive,
    toggleArchivedStatusDetail,
    backToGrid,
    setHideArchived,
    isMediaVisible
} from '../helpers/interactions.js';

describe('CUJ: Content Lifecycle (Manual Archiving)', () => {
    before(async () => {
        await waitForAppReady();
    });

    it('should decouple completion from archiving and handle visibility', async () => {
        // 1) Open the app and navigate to "Library"
        await navigateTo('media');
        expect(await verifyActiveView('media')).toBe(true);

        // 2) Click on an entry that is currently "Ongoing" and "Active"
        // "呪術廻戦" is Ongoing and Active by default in seed.ts
        await clickMediaItem('呪術廻戦');

        // 3) In the detail view, click "Mark as Complete" (#btn-mark-complete)
        await clickMarkAsComplete();

        // 4) Verify that the tracking status dropdown shows "Complete"
        expect(await getDetailTrackingStatus()).toBe('Complete');

        // 5) Verify that the "Archived/Active" toggle remains in the "Active" position
        expect(await isArchivedStatusActive()).toBe(true);

        // 6) Manually click the toggle (#status-toggle) to switch the status to "Archived"
        await toggleArchivedStatusDetail();
        expect(await isArchivedStatusActive()).toBe(false);

        // 7) Navigate back to the library grid (#btn-back-grid)
        await backToGrid();
        expect(await verifyActiveView('media')).toBe(true);

        // 8) Verify that the entry is no longer visible if "Hide Archived" is enabled
        await setHideArchived(true);
        expect(await isMediaVisible('呪術廻戦')).toBe(false);

        // 9) Toggle "Hide Archived" to OFF and verify the entry reappears
        await setHideArchived(false);
        expect(await isMediaVisible('呪術廻戦')).toBe(true);
        
        // Verify archived visual indicator (opacity 0.6)
        const item = await $(`[data-title="呪術廻戦"]`);
        expect(await item.getCSSProperty('opacity')).toMatchObject({ value: 0.6 });
    });
});
