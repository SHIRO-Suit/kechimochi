import { save as tauriSave, open as tauriOpen, type SaveDialogOptions, type OpenDialogOptions } from '@tauri-apps/plugin-dialog';

/**
 * Wrapper for Tauri's save dialog that allows for E2E testing overrides.
 */
export async function save(options?: SaveDialogOptions): Promise<string | null> {
    // E2E Test Hook
    const win = window as unknown as Record<string, string | null>;
    if (win.mockSavePath) {
        // eslint-disable-next-line no-console
        console.log("[Dialog] Using mockSavePath:", win.mockSavePath);
        return win.mockSavePath;
    }
    return tauriSave(options);
}

/**
 * Wrapper for Tauri's open dialog that allows for E2E testing overrides.
 */
export async function open(options?: OpenDialogOptions): Promise<string | string[] | null> {
    // E2E Test Hook
    const win = window as unknown as Record<string, string | string[] | null>;
    if (win.mockOpenPath) {
        // eslint-disable-next-line no-console
        console.log("[Dialog] Using mockOpenPath:", win.mockOpenPath);
        return win.mockOpenPath;
    }
    return tauriOpen(options);
}
