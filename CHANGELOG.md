# Changelog

## v3.1.0 — Fix & cleanup

- Mobilde navigasyon artık kaybolmuyor; terminal üst barında yatay kullanılabiliyor.
- Dil değiştirme güvenli localStorage kullanıyor ve dinamik GitHub içeriğini yeniden render ediyor.
- GitHub API için kısa süreli local cache eklendi; rate-limit durumlarında son veri korunuyor.
- GitHub hata çıktısında `innerHTML` kaldırıldı.
- Section observer ile aktif navigasyon durumu eklendi.
- Service worker cache v3.1'e yükseltildi ve offline davranışı sadeleştirildi.
- Privacy / Terms sayfaları eski kart/gradient görünümünden terminal doküman görünümüne geçirildi.
- Klavye focus stilleri eklendi.
- Hero ölçüsü küçültülerek klasik portfolio görünümü daha da azaltıldı.
- Discord/Open Graph görseli yeni dosya adına taşındı ve sadeleştirildi.

## v3.0.0 — Coffee Terminal

- Ana tasarım terminal odaklı olarak yeniden kuruldu.
- Kart/grid/glass ağırlıklı eski portfolio görünümü kaldırıldı.
- Projeler Flask, YHMod, YH Ticket ve Coffee Lab olarak güncellendi.
