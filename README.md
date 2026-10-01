# k4hveci.info

K4hveci kişisel site yüzeyi — **K4 System / Coffee Terminal**.

Canlı adres: https://k4hveci.info/  
GitHub Pages: https://k4hvecii.github.io/

## K4 System v5

Yeni yapı daha az “terminal şakası”, daha fazla gerçek sistem yüzeyi olacak şekilde düzenlendi:

- büyük ama sakin hero + gerçek durum paneli
- üretimde kullanılan sistemler için ayrı yüzey
- GitHub profil/repo verilerini canlı çekme
- çekirdek stack ve çalışma prensipleri
- TR / EN içerik
- responsive, reduced-motion ve klavye erişilebilirliği
- bağımlılıksız HTML/CSS/JS; GitHub Pages üzerinde direkt yayın

## Yerel çalıştırma

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini aç.

## Doğrulama

```bash
node scripts/validate.mjs
```

## Tasarım yönü

Koyu kahve / charcoal taban, düşük doygunluk, sıcak krem metin, tek kahve aksanı.  
Glassmorphism, neon duvarı ve klasik badge-kart portföy kalıpları özellikle kullanılmıyor.

## Veri mimarisi

GitHub profilindeki `data/` klasörü K4 System için tek veri kaynağıdır. Site sistem/stack verisini buradan okur; profil workflow'u aynı veriden README SVG yüzeyini ve günlük GitHub aktivite verisini üretir.

Coding activity günlük olarak contributions, streak, velocity, language dağılımı ve weekday aktivitesiyle güncellenir.

## Motion system

K4 Motion System v1; hero girişleri, terminal typing, section reveal, pointer glow, scroll progress, sayaç animasyonları, contribution heatmap/language/weekday geçişleri ve düşük yoğunluklu ambient hareket ekler. `prefers-reduced-motion` sistem tercihi tamamen desteklenir.
