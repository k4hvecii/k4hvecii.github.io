import { SITE_CONFIG } from "../config.js";

const languageManifestUrl = new URL("../../i18n/languages.json", import.meta.url);

function deepGet(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function readStoredLocale() {
  try {
    return localStorage.getItem(SITE_CONFIG.localeStorageKey);
  } catch {
    return null;
  }
}

function saveLocale(locale) {
  try {
    localStorage.setItem(SITE_CONFIG.localeStorageKey, locale);
  } catch {
    // Locale persistence is optional.
  }
}

export class I18n {
  constructor() {
    this.locale = SITE_CONFIG.defaultLocale;
    this.messages = {};
    this.languages = [];
    this.listeners = new Set();
  }

  async init() {
    this.languages = await this.#loadLanguages();
    const saved = readStoredLocale();
    const browserLocale = navigator.language?.split("-")[0]?.toLowerCase();
    const preferred = saved || (this.#isSupported(browserLocale) ? browserLocale : SITE_CONFIG.defaultLocale);
    await this.setLocale(preferred, { persist: false });
    return this;
  }

  async setLocale(locale, { persist = true } = {}) {
    const normalized = this.#isSupported(locale) ? locale : SITE_CONFIG.fallbackLocale;
    const localeUrl = new URL(`../../i18n/${normalized}.json`, import.meta.url);
    const response = await fetch(localeUrl);
    if (!response.ok) throw new Error(`Locale could not be loaded: ${normalized}`);

    this.messages = await response.json();
    this.locale = normalized;
    const language = this.languages.find((item) => item.code === normalized);
    document.documentElement.lang = normalized;
    document.documentElement.dir = language?.dir || "ltr";
    if (persist) saveLocale(normalized);

    this.apply(document);
    this.#updateMetadata();
    this.listeners.forEach((listener) => listener(normalized));
  }

  t(key, fallback = key) {
    const value = deepGet(this.messages, key);
    return typeof value === "string" ? value : fallback;
  }

  apply(scope = document) {
    scope.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = this.t(element.dataset.i18n, element.textContent);
    });

    scope.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", this.t(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || ""));
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", this.t(element.dataset.i18nPlaceholder, element.getAttribute("placeholder") || ""));
    });
  }

  onChange(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  getCurrentLanguage() { return this.languages.find((language) => language.code === this.locale); }

  async #loadLanguages() {
    const response = await fetch(languageManifestUrl);
    if (!response.ok) throw new Error("Language manifest could not be loaded");
    const data = await response.json();
    return data.filter((language) => language.enabled !== false);
  }

  #isSupported(locale) { return Boolean(locale && this.languages.some((language) => language.code === locale)); }

  #updateMetadata() {
    const title = this.t("meta.title", document.title);
    const descriptionText = this.t("meta.description", "");
    document.title = title;

    const setMeta = (selector, attr, value) => {
      const element = document.querySelector(selector);
      if (element && value) element.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", descriptionText);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", descriptionText);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", descriptionText);
  }
}
