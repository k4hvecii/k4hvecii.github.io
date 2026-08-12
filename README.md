# k4hvecii.github.io — Portfolio V2

Kıvanç Aydoğdu'nun modüler, çok dilli ve GitHub Pages uyumlu kişisel developer sitesi.

## V2 özellikleri

- Modüler CSS ve ES Modules mimarisi
- Ölçeklenebilir JSON tabanlı i18n sistemi
- Aramalı dil seçici
- TR / EN ve kolay yeni dil ekleme
- Dark / light tema ve tercih kalıcılığı
- Animasyonlu landing + scroll reveal + scroll progress
- Reduced-motion desteği
- Data-driven proje sistemi
- Erişilebilir proje detay modalı
- Data-driven sosyal bağlantılar
- GitHub profil + son güncellenen public repo entegrasyonu
- GitHub API timeout, cache ve graceful fallback
- PWA/service worker ve offline fallback
- robots.txt, sitemap.xml, manifest, canonical, OpenGraph, Twitter Card ve JSON-LD
- Responsive mobil menü ve aktif bölüm vurgusu
- Harici frontend framework veya build zorunluluğu yok

## Dil eklemek

1. `assets/i18n/tr.json` ile aynı key yapısında yeni locale oluştur (`de.json` gibi).
2. `assets/i18n/languages.json` içine dili ekle.
3. `dir` alanını `ltr` veya RTL diller için `rtl` olarak ayarla.

Dil menüsü otomatik oluşur; HTML'e yeni buton eklenmez.

## Proje eklemek

Projeler `assets/data/projects.json` üzerinden render edilir. Çevrilecek metinler locale dosyalarındaki `projectItems` bölümünde tutulur.

## Sosyal bağlantı eklemek

`assets/data/socials.json` dosyasına yeni kayıt eklenir. Gerekirse `assets/js/modules/social-links.js` içindeki icon haritasına ikon eklenir.

## Yerel test

`file://` ile açma. ES Modules ve JSON fetch kullandığı için HTTP sunucusu gerekir:

```bash
python -m http.server 8080
```

Sonra `http://localhost:8080`.

## GitHub Pages

- Settings → Pages
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/(root)`

## Not

Özel alan adı alındığında `assets/js/config.js`, canonical, OpenGraph URL, JSON-LD, `robots.txt` ve `sitemap.xml` tek seferde yeni domain ile güncellenmelidir.


## V2.2 quality layer

### Automated quality checks

`.github/workflows/quality.yml` runs on pushes and pull requests targeting `main`.

It validates:

- JSON syntax
- TR/EN translation parity
- Enabled language files
- Project translation references
- Status translation references
- Duplicate project IDs/numbers
- Duplicate HTML IDs
- Internal anchor targets
- `aria-controls` targets
- Static HTML asset paths
- JavaScript module imports
- CSS imports
- Service worker application-shell paths

The workflow intentionally has no npm dependencies.

### Current status

`assets/data/status.json` is the single source of truth for the current-work panel.

Example:

```json
{
  "state": "building",
  "title": "Vanguardn",
  "labelKey": "status.building.label",
  "descriptionKey": "status.building.description",
  "updatedAt": "2026-08-12",
  "accent": "success"
}
```

Updating this file changes the hero status and about-status presentation without editing HTML.

### Project details

Project cards remain data-driven through `assets/data/projects.json`.

Each project can now define:

- card description
- long detail description
- status
- visibility
- technology tags
- project facts
- highlights
- external actions

### OpenGraph image

The social share image is:

`assets/images/og-card.png`

Recommended size: `1200x630`.
