// Tahta kuralları. DOM'a ve window'a dokunmaz, sadece sayılarla çalışır.
// Tahta: 4x4 dizi dizisi. 0 = boş, 1..ASAMA_SAYISI = aşama numarası.

const BOYUT = 4;
const ASAMA_SAYISI = 10; // tek yerden okunur: en üst aşama (H)

// Aynı satırı sola kaydır ve birleştir. Bir taş en fazla bir kez birleşir.
// hedefler[k]: k. konumdaki taşın gittiği konum (boşsa null), birlesti[k]: birleşmeye girdi mi
function satiriSolaKaydir(satir) {
  const sonuc = [];
  const hedefler = new Array(satir.length).fill(null);
  const birlesti = new Array(satir.length).fill(false);
  let puan = 0;
  let enUst = false;
  let onceki = -1; // son taşın konumu (sonuc içinde), birleşmeye açıksa
  let oncekiAcik = false;
  for (let k = 0; k < satir.length; k++) {
    const bu = satir[k];
    if (bu === 0) continue;
    // Bir önceki taşla aynıysa ve henüz birleşmediyse birleş (H hariç)
    if (oncekiAcik && sonuc[onceki] === bu && bu < ASAMA_SAYISI) {
      const yeni = bu + 1;
      sonuc[onceki] = yeni;
      hedefler[k] = onceki;
      birlesti[k] = true;
      // önceki taşı geriye dönük işaretle
      for (let j = 0; j < k; j++) if (hedefler[j] === onceki) birlesti[j] = true;
      puan += 2 ** yeni; // puan: 2 üzeri yeni aşama numarası
      if (yeni === ASAMA_SAYISI) enUst = true;
      oncekiAcik = false; // yeni oluşan taş tekrar birleşemez
    } else {
      sonuc.push(bu);
      onceki = sonuc.length - 1;
      hedefler[k] = onceki;
      oncekiAcik = true;
    }
  }
  while (sonuc.length < satir.length) sonuc.push(0);
  return { satir: sonuc, puan, enUst, hedefler, birlesti };
}

// Yön için i. çizgiyi duvara doğru (kaydırma sırasıyla) oku/yaz
function cizgiHucreleri(yon, i) {
  const hucreler = [];
  for (let k = 0; k < BOYUT; k++) {
    if (yon === "sol") hucreler.push([i, k]);
    else if (yon === "sag") hucreler.push([i, BOYUT - 1 - k]);
    else if (yon === "yukari") hucreler.push([k, i]);
    else if (yon === "asagi") hucreler.push([BOYUT - 1 - k, i]);
    else throw new Error("Geçersiz yön: " + yon);
  }
  return hucreler;
}

function bosTahta() {
  return Array.from({ length: BOYUT }, () => new Array(BOYUT).fill(0));
}

// Tahtayı bir yöne kaydırır; girdiyi değiştirmez, yeni tahta döner.
// hareketler: her taş için { kaynak, hedef, birlesti } (hücre indeksi = satır * BOYUT + sütun).
// Yerinde kalan taşın kaynağı ve hedefi aynıdır. Birleşen iki taşın hedefi aynıdır.
function kaydir(tahta, yon) {
  const yeni = bosTahta();
  const hareketler = [];
  let puan = 0;
  let hareket = false;
  let enUstOlustu = false;
  for (let i = 0; i < BOYUT; i++) {
    const hucreler = cizgiHucreleri(yon, i);
    const sonuc = satiriSolaKaydir(hucreler.map(([r, c]) => tahta[r][c]));
    puan += sonuc.puan;
    if (sonuc.enUst) enUstOlustu = true;
    hucreler.forEach(([r, c], k) => {
      yeni[r][c] = sonuc.satir[k];
      if (yeni[r][c] !== tahta[r][c]) hareket = true;
      if (sonuc.hedefler[k] === null) return; // boş hücre
      const [hr, hc] = hucreler[sonuc.hedefler[k]];
      hareketler.push({
        kaynak: r * BOYUT + c,
        hedef: hr * BOYUT + hc,
        birlesti: sonuc.birlesti[k],
      });
    });
  }
  return { tahta: yeni, puan, hareket, enUstOlustu, hareketler };
}

// Boş bir hücreye yeni taş koyar: %90 A (1), %10 B (2). Yer yoksa null.
function yeniTasEkle(tahta, rastgele = Math.random) {
  const bos = [];
  for (let r = 0; r < BOYUT; r++) {
    for (let c = 0; c < BOYUT; c++) if (tahta[r][c] === 0) bos.push([r, c]);
  }
  if (bos.length === 0) return null;
  const [r, c] = bos[Math.floor(rastgele() * bos.length)];
  const deger = rastgele() < 0.9 ? 1 : 2;
  const kopya = tahta.map((s) => s.slice());
  kopya[r][c] = deger;
  return { tahta: kopya, konum: [r, c], indeks: r * BOYUT + c, deger };
}

// Tahta dolu ve hiçbir yönde birleşme yoksa oyun biter.
function bittiMi(tahta) {
  for (const satir of tahta) if (satir.includes(0)) return false;
  return ["sol", "sag", "yukari", "asagi"].every((y) => !kaydir(tahta, y).hareket);
}

// Yeni oyun durumu: 2 taşla başlar.
function yeniOyun(rastgele = Math.random) {
  let tahta = bosTahta();
  for (let i = 0; i < 2; i++) tahta = yeniTasEkle(tahta, rastgele).tahta;
  return { tahta, puan: 0, kazandi: false, bitti: false };
}

// Bir hamle yapar ve durumu günceller. Hiçbir taş oynamadıysa hiçbir şey olmaz.
// Dönüş: { hareket, kazanmaYeni, hareketler, yeniTas }
// (kazanma sadece ilk H'de bir kez bildirilir; yeniTas yeni düşen taşın hücre indeksi)
function hamleYap(durum, yon, rastgele = Math.random) {
  if (durum.bitti) return { hareket: false, kazanmaYeni: false, hareketler: [], yeniTas: null };
  const s = kaydir(durum.tahta, yon);
  if (!s.hareket) return { hareket: false, kazanmaYeni: false, hareketler: [], yeniTas: null };
  const yeniTas = yeniTasEkle(s.tahta, rastgele);
  durum.tahta = yeniTas.tahta;
  durum.puan += s.puan;
  let kazanmaYeni = false;
  if (s.enUstOlustu && !durum.kazandi) {
    durum.kazandi = true;
    kazanmaYeni = true;
  }
  durum.bitti = bittiMi(durum.tahta);
  return { hareket: true, kazanmaYeni, hareketler: s.hareketler, yeniTas: yeniTas.indeks };
}

// Node'da test için dışa aktar; tarayıcıda module yoktur, atlanır.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BOYUT, ASAMA_SAYISI, bosTahta, kaydir, yeniTasEkle, bittiMi, yeniOyun, hamleYap,
  };
}
