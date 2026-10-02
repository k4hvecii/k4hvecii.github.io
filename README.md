# k4hveci.info

K4hveci kişisel site yüzeyi — K4 / Coffee Lab.

Canlı adres: https://k4hveci.info/  
GitHub Pages: https://k4hvecii.github.io/

## Coffee Lab v7.1

v7.1, Coffee Lab yönünü korurken ölçeği normale çekti: daha dengeli tipografi, daha sıkı dikey ritim ve daha kullanılabilir masaüstü yoğunluğu.

- büyük tipografiyle K4 / HVE.CI hero
- Coffee Lab kimliği
- sistemler klasik kart yerine case file satırları
- public GitHub reposu artifact listesi olarak sunulur
- coding activity bir dashboard yerine signal room mantığında gösterilir
- ortak profile/system/stack/activity verisi korunur
- canlı GitHub REST verisi korunur
- desktop, tablet ve mobil için farklı kompozisyon
- motion ve pointer glow detayları ölçülü kullanılır
- prefers-reduced-motion desteği vardır
- bağımlılıksız HTML/CSS/JS ve GitHub Pages

## Yerel çalıştırma

python -m http.server 8000

## Doğrulama

node scripts/validate.mjs

## Veri

GitHub profil reposundaki data klasörü ortak veri kaynağıdır. Site bu kaynaktan profil, sistem, stack ve coding activity verisini okur. Public repository listesi GitHub REST API üzerinden canlı gelir.
