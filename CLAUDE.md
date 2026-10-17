# Abece

Tarayıcıda çalışan 4x4 harf birleştirme oyunu. Sadece HTML, CSS, düz JavaScript; kütüphane ve modül yok (çift tıklayınca çalışır). Kod özgündür, başka oyundan kopyalanmaz.

## Sabit kararlar
Kullanıcı onayı olmadan değiştirilmez.
- Tahta 4x4. Aşamalar sırayla: A, B, C, Ç, D, E, F, G, Ğ, H (10 aşama). Mantık tahtayı 0 (boş) ve 1..10 ile tutar; harfe çevirme sadece `js/ekran.js` içinde (`HARFLER`). Aşama sayısı tek sabitten okunur (`ASAMA_SAYISI`, `js/mantik.js`).
- İki aynı aşama birleşince bir üst aşama olur; bir hamlede bir taş en fazla bir kez birleşir. H en üst aşama, iki H birleşmez.
- Her geçerli hamleden sonra boş hücreye yeni taş düşer: %90 A, %10 B. Oyun 2 taşla başlar. Hiç taş oynamadıysa hamle sayılmaz, yeni taş düşmez.
- Puan: yeni oluşan aşama numarası n ise 2 üzeri n.
- İlk H oluşunca kazanma bir kez bildirilir, oyun devam eder. Tahta doluysa ve birleşme yoksa oyun biter.
- Taşlarda sadece büyük, kalın, ortalanmış harf var; sayı ve çizim yok.

## Yapı kuralları
- `js/mantik.js` DOM'a ve window'a dokunmaz.
- Tüm renkler `style.css` başında CSS değişkenleri. Taş renkleri A'dan H'ye koyulaşır; harf/zemin kontrastı en az 4.5 (WCAG).
- Dosyalar `index.html` içinde sade `<script>` ile bağlanır. Yorumlar kısa ve Türkçe.
- Test: `node test-mantik.js`, `node test-depo.js`, `node test-girdi.js`
- Git: ana dal `main`, commit mesajları Türkçe. Etiket ve push sadece ben açıkça isteyince.

## Dosyalar
- `js/mantik.js` kurallar, `js/ekran.js` çizim, `js/oyun.js` bağlantı (klavye + dokunmatik).
- `js/depo.js` en yüksek skor (localStorage, anahtar `abeceEnYuksekSkor`). Depolama dışarıdan verilir; hata olursa skor bellekte tutulur. Oyun kurallarını bilmez.
- `js/girdi.js` `yonBul(dx, dy, esik)`: kaydırma yönünü bulan saf fonksiyon.

## v0.2 değişiklikleri
- En yüksek skor puanın yanında; "Yeni oyun" onu sıfırlamaz.
- Dokunmatik kaydırma (eşik 30 px, tek parmak, tahtada `touch-action: none`).
- Taş renkleri yeniden ayarlandı: komşu taşlar arası CIE L* farkı en az 6 (şu an 7.8), WCAG 4.5 geçerli.
