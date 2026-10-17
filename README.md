# Abece

4x4 tahtada harfleri birleştirip büyüttüğün bir tarayıcı oyunu. Aşamalar: A, B, C, Ç, D, E, F, G, Ğ, H.

## Çalıştırma
`index.html` dosyasına çift tıkla. Kurulum ve kütüphane yok.

## Nasıl oynanır
Ok tuşlarıyla taşları kaydır. Aynı harften ikisi çarpışınca bir sonraki harfe dönüşür. H'ye ulaşırsan kazanırsın, istersen devam edebilirsin. Tahta dolar ve birleşme kalmazsa oyun biter.

## Dosyalar
- `js/mantik.js`: tahta kuralları (sayılarla çalışır)
- `js/ekran.js`: tahtayı çizer, sayıyı harfe çevirir
- `js/oyun.js`: tuşlar, puan ve düğme
- `test-mantik.js`: mantık testleri

## Test
```
node test-mantik.js
```
