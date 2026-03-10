import { save as tauriSave, open as tauriOpen, type SaveDialogOptions, type OpenDialogOptions } from '@tauri-apps/plugin-dialog';

/**
 * Wrapper for Tauri's save dialog that allows for E2E testing overrides.
 */
export async function save(options?: SaveDialogOptions): Promise<string | null> {
    // E2E Test Hook
    if ((window as any).mockSavePath) {
        console.log("[Dialog] Using mockSavePath:", (window as any).mockSavePath);
        return (window as any).mockSavePath;
    }
    return tauriSave(options);
}

/**
 * Wrapper for Tauri's open dialog that allows for E2E testing overrides.
 */
export async function open(options?: OpenDialogOptions): Promise<string | string[] | null> {
    // E2E Test Hook
    if ((window as any).mockOpenPath) {
        console.log("[Dialog] Using mockOpenPath:", (window as any).mockOpenPath);
        return (window as any).mockOpenPath;
    }
    return tauriOpen(options);
}
