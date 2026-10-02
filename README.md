# k4hveci.info

K4hveci kişisel site yüzeyi — **K4 System**.

Canlı adres: https://k4hveci.info/  
GitHub Pages: https://k4hvecii.github.io/

## K4 System v6

v6 arayüzü sıfırdan yeniden tasarlandı. Masaüstünde klasik 16px tabanın yaklaşık **%125 görsel ölçeğini** hedefliyor; tablet ve mobilde aynı masaüstü düzenini küçültmek yerine kırılımlara göre yeniden akıyor.

- tüm section ve ana component yüzeyleri full-width
- masaüstü: geniş iki bölgeli kompozisyon
- tablet: intro/content ayrımı tek akışa dönüşür
- mobil: navigasyon, repo satırları, activity panelleri ve CTA'lar dokunmatik kullanıma göre yeniden yerleşir
- sistemler ve toolbox ortak profil data kaynağından gelir
- public GitHub yüzeyi canlı GitHub REST verisini kullanır
- coding activity günlük profil workflow verisini kullanır
- TR / EN içerik
- reduced-motion desteği
- bağımlılıksız HTML/CSS/JS; GitHub Pages üzerinde direkt yayın

## Responsive taban

Desktop >= 1200px: 20px base / yaklaşık %125 ölçek.  
Tablet 768–1199px: 18px base ve tek akış section yerleşimi.  
Mobile < 768px: 16.5px base, dokunmatik ve tek kolon adaptive yerleşim.

## Yerel çalıştırma

~~~bash
python -m http.server 8000
~~~

Ardından http://localhost:8000 adresini aç.

## Doğrulama

~~~bash
node scripts/validate.mjs
~~~

## Veri mimarisi

GitHub profilindeki data klasörü K4 System için ortak veri kaynağıdır. Site profile/system/stack ve günlük GitHub activity verisini bu kaynaktan okur; public repo kartları ise GitHub REST API ile canlı güncellenir.
