import { waitForAppReady } from '../helpers/setup.js';
import { 
    navigateTo, 
    verifyActiveView, 
    clickMediaItem,
    addExtraField,
    calculateReport,
    getProjectionValue,
    logActivityGlobal,
    clickBackButton
} from '../helpers/interactions.js';

describe('CUJ: Progress Analysis (Projections)', () => {
    before(async () => {
        await waitForAppReady();
    });

    it('should calculate reading speeds and show correct projections per media type', async () => {
        await navigateTo('media');
        await clickMediaItem('ダンジョン飯');
        await addExtraField('Character count', '3000');
        await clickBackButton();

        await clickMediaItem('ある魔女が死ぬまで');
        await addExtraField('Character count', '14250');
        await clickBackButton();

        await clickMediaItem('STEINS;GATE');
        await addExtraField('Character count', '31500');

        await navigateTo('profile');
        await calculateReport();

        await navigateTo('media');
        await clickMediaItem('呪術廻戦');
        await addExtraField('Character count', '6000');
        expect(await getProjectionValue('est-remaining-time')).toBe('15min');
        expect(await getProjectionValue('est-completion-rate')).toBe('75%');
        await clickBackButton();

        await clickMediaItem('薬屋のひとりごと');
        await addExtraField('Character count', '15000');
        expect(await getProjectionValue('est-remaining-time')).toBe('1h15min');
        expect(await getProjectionValue('est-completion-rate')).toBe('75%');

        await logActivityGlobal('呪術廻戦', 30);
        
        await navigateTo('media');
        await clickMediaItem('呪術廻戦');
        
        expect(await getProjectionValue('est-remaining-time')).toBe('0min');
        expect(await getProjectionValue('est-completion-rate')).toBe('100%');
    });
});
