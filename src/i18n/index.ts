import { Temporal } from "@js-temporal/polyfill";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

if (!(globalThis as any).Temporal) {
  (globalThis as any).Temporal = Temporal;
}

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: "ko",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
