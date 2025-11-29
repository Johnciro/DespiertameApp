import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { translations } from './translations';

const i18n = new I18n(translations);

// Configurar locale con manejo de errores
let locales: Localization.Locale[] = [];
try {
    locales = Localization.getLocales();
    i18n.locale = locales[0]?.languageCode ?? 'es';
} catch (error) {
    console.error('Error getting locales, defaulting to Spanish:', error);
    i18n.locale = 'es';
}
i18n.enableFallback = true;

export default i18n;

export const getTTSLanguage = () => {
    try {
        const code = locales[0]?.languageCode ?? 'es';
        switch (code) {
            case 'pt': return 'pt-BR';
            case 'en': return 'en-US';
            default: return 'es-ES';
        }
    } catch (error) {
        console.error('Error getting TTS language, defaulting to Spanish:', error);
        return 'es-ES';
    }
};
