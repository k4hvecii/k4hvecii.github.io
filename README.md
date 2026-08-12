# k4hvecii.github.io — Professional Portfolio

Kıvanç Aydoğdu'nun modüler, çok dilli ve GitHub Pages uyumlu kişisel web sitesi.

## Mimari

```text
.
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── .nojekyll
├── .gitignore
├── README.md
└── assets
    ├── css
    │   ├── main.css
    │   ├── tokens.css
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   ├── animations.css
    │   ├── responsive.css
    │   └── 404.css
    ├── data
    │   └── projects.json
    ├── i18n
    │   ├── languages.json
    │   ├── tr.json
    │   └── en.json
    ├── icons
    │   └── favicon.svg
    └── js
        ├── config.js
        ├── main.js
        ├── core
        │   ├── github.js
        │   └── i18n.js
        └── modules
            ├── github-card.js
            ├── language-picker.js
            ├── navigation.js
            ├── projects.js
            ├── scroll-effects.js
            └── theme.js
```

## Dil sistemi

Dil seçici `assets/i18n/languages.json` dosyasından otomatik üretilir.

Yeni bir dil eklemek için:

1. Örneğin `assets/i18n/de.json` dosyasını oluştur.
2. `tr.json` / `en.json` ile aynı key yapısını kullan.
3. `languages.json` içine dili ekle:

```json
{
  "code": "de",
  "nativeName": "Deutsch",
  "short": "DE",
  "dir": "ltr",
  "enabled": true
}
```

HTML veya JavaScript tarafında yeni buton yazmaya gerek yoktur.

RTL diller için `dir: "rtl"` kullanılabilir.

## Proje yönetimi

Projeler `assets/data/projects.json` dosyasından render edilir.

Yeni proje için JSON listesine kayıt eklenir. Çevrilecek açıklamalar locale dosyalarındaki `projectItems` alanından alınır.

## GitHub entegrasyonu

GitHub profil verisi tarayıcıdan GitHub public API ile alınır.

- 6 saniye timeout
- 10 dakika localStorage cache
- API erişilemezse graceful fallback

## Yerel test

`file://` üzerinden açmak yerine yerel HTTP sunucusu kullan:

```bash
python -m http.server 8080
```

Sonra:

`http://localhost:8080`

## GitHub Pages

Repository kullanıcı sitesi olduğu için mevcut yapı doğrudan `main` branch root üzerinden yayınlanabilir:

- Settings → Pages
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)

## Custom domain

Daha sonra `kivanc.vanguardn.xyz` kullanılacaksa DNS tarafında:

- Type: `CNAME`
- Name: `kivanc`
- Target: `k4hvecii.github.io`

Ardından GitHub Pages → Custom domain bölümüne `kivanc.vanguardn.xyz` girilir.

Custom domain aktif edildiğinde `robots.txt`, `sitemap.xml`, OpenGraph URL ve JSON-LD içindeki `k4hvecii.github.io` adresleri de yeni domain ile güncellenmelidir.
