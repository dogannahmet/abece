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
- `js/depo.js` en yüksek skor (localStorage, anahtar `abeceEnYuksekSkor`) ve oyun kaydı (anahtar `abeceOyunDurumu`). Depolama dışarıdan verilir; hata olursa skor bellekte tutulur, kayıt sessizce atlanır. Oyun kurallarını bilmez (sadece `BOYUT` ve `ASAMA_SAYISI` sabitlerini okur).
- `js/girdi.js` `yonBul(dx, dy, esik)`: kaydırma yönünü bulan saf fonksiyon.

## v0.2 değişiklikleri
- En yüksek skor puanın yanında; "Yeni oyun" onu sıfırlamaz.
- Dokunmatik kaydırma (eşik 30 px, tek parmak, tahtada `touch-action: none`).
- Taş renkleri yeniden ayarlandı: komşu taşlar arası CIE L* farkı en az 6 (şu an 7.8), WCAG 4.5 geçerli.

## v0.3 değişiklikleri (animasyon)
- `kaydir` ve `hamleYap` sonuçlarına `hareketler` eklendi: her taş için `{ kaynak, hedef, birlesti }` (hücre indeksi = satır * 4 + sütun). Hareket etmeyen taşın kaynağı ve hedefi aynı; birleşen iki taşın hedefi aynı. `hamleYap` ayrıca `yeniTas` (yeni taşın indeksi) döndürür; hareketsiz hamlede `hareketler: []`, `yeniTas: null`. Tahta temsili (0 ve 1..10) değişmedi.
- `js/ekran.js`: taşlar sabit konumlu elementler, konum `--r`/`--c` ile `transform: translate`. Hücre boyutu CSS'ten (`--aralik`), piksel yok. Kayma ~120 ms ease-out, birleşmede zıplama, yeni taşta beliriş (animasyonlar iç elementte, konumla karışmaz).
- Animasyon sürerken yeni hamle gelirse eskisi hemen biter, girdi yutulmaz. `prefers-reduced-motion: reduce` açıksa animasyon yok. Kayma süresi `style.css` `--kayma` ve `ekran.js` `KAYMA_MS` ile aynı tutulur.

## v0.4 değişiklikleri (kaldığı yerden devam)
- Kayıt biçimi (JSON, anahtar `abeceOyunDurumu`): `{ surum: 1, tahta, puan, kazanmaBildirildi }`. Tahta temsili aynı (0 ve 1..10). `bitti` kaydedilmez, tahtadan yeniden hesaplanır.
- `durumGecerliMi` saf doğrulama yapar: sürüm 1, tahta 4x4, hücreler 0..10 tam sayı, puan negatif olmayan sayı, `kazanmaBildirildi` boolean, tahta tamamen boş değil. Geçersiz ya da bozuk kayıt yok sayılır ve silinir.
- Açılışta geçerli kayıt varsa oyun oradan kurulur (animasyonsuz çizilir), yoksa yeni oyun başlar. Her geçerli hamleden sonra kayıt yazılır.
- **Oyun bitince kayıt silinir.** "Yeni oyun" kaydı silip yeni oyun başlatır. En yüksek skor hiçbir durumda sıfırlanmaz.
- `mantik.js` `durumdanOyunKur(kayit)`: kayıttan oyun durumu kurar.

## Yayın
- Canlı adres: https://dogannahmet.github.io/abece/ (GitHub Pages, `main` dalı).
- `main`'e push edilince GitHub Pages bir iki dakika içinde güncellenir.
- `docs/` klasörü sadece README'nin görsellerini tutar (`docs/ekran.png`, 800 px geniş, 300 KB altı); oyun koduyla ilgisi yok.
