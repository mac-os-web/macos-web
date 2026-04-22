import { Temporal } from "@js-temporal/polyfill";
import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

if (!(globalThis as any).Temporal) {
  (globalThis as any).Temporal = Temporal;
}

// Lazy-load locale JSON on demand. Only the active language bundle is downloaded.
i18n
  .use(resourcesToBackend((language: string) => import(`./locales/${language}.json`)))
  .use(initReactI18next)
  .init({
    lng: "ko",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
