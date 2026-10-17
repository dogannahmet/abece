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
- Test: `node test-mantik.js`
- Git: ana dal `main`, uzak repo ve push yok, etiket (tag) sadece kullanıcı isterse yerel atılır, commit mesajları Türkçe.
