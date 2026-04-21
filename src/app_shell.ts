export function syncAppShell(
    isDesktop: boolean,
    supportsWindowControls: boolean = isDesktop,
    doc: Document = document,
): void {
    doc.body.dataset.runtime = supportsWindowControls
        ? 'desktop'
        : isDesktop
            ? 'mobile-app'
            : 'web';

    if (supportsWindowControls) {
        return;
    }

    doc.getElementById('desktop-title-bar')?.remove();
}
