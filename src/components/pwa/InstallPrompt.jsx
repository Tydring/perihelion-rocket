import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Download } from 'lucide-react';

export function InstallPrompt() {
    const { installPrompt, promptToInstall } = usePWA();

    if (!installPrompt) return null;

    return (
        <button
            onClick={promptToInstall}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 animate-bounce-subtle"
        >
            <Download className="h-5 w-5" />
            <span>Instalar App</span>
        </button>
    );
}
