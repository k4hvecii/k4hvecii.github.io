# k4hveci.info

K4hveci kişisel site yüzeyi — **System Atlas v9.1**.

Canlı adres: https://k4hveci.info/  
GitHub Pages: https://k4hvecii.github.io/

## v9.1 yapısal yön

v9 sadece renk/tipografi değişikliği değil; sitenin bilgi mimarisi yeniden kuruldu.

- hero içinde interaktif system map
- map üzerindeki node'lar doğrudan ilgili sistem dosyasını açar
- System Atlas bölümünde listeden sistem seçildiğinde sağdaki inspector canlı değişir
- Build Path, çalışma yaklaşımını dört gerçek adıma böler
- public GitHub alanı standart liste yerine farklı boyutlu repo mosaic kullanır
- Coding Activity tek ekranda her şeyi göstermiyor; Observatory içindeki sekmelerden incelenir
- desktop'ta bölüm rail'i ile sayfa konumu izlenir
- tablet ve mobilde explorer, inspector, atlas map ve Observatory yeniden akar
- ortak profile/system/stack/activity data mimarisi korunur
- TR / EN ve reduced-motion korunur
- bağımlılıksız HTML/CSS/JS ve GitHub Pages

## Yerel çalıştırma

python -m http.server 8000

## Doğrulama

node scripts/validate.mjs
