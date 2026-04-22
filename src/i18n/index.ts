import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";
import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

// `Temporal` is already globally typed by TypeScript (Stage 3 proposal), but
// browsers haven't shipped the implementation yet. Register the polyfill when
// missing. The polyfill's types are slightly narrower than the built-in
// declaration, so we cross the boundary via `unknown`.
if (!globalThis.Temporal) {
  globalThis.Temporal = TemporalPolyfill as unknown as typeof globalThis.Temporal;
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
