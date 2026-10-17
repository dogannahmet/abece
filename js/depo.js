// En yüksek skoru saklar. Oyun kurallarını bilmez.
// Depolama dışarıdan verilir (varsayılan localStorage); Node'da sahte nesneyle test edilir.
const SKOR_ANAHTARI = "abeceEnYuksekSkor";
const DURUM_ANAHTARI = "abeceOyunDurumu";
const DURUM_SURUMU = 1;

// Tahta boyutu ve aşama sınırı tek yerden (mantik.js) okunur
function kurallariAl() {
  if (typeof module !== "undefined" && module.exports) return require("./mantik.js"); // Node
  return { BOYUT, ASAMA_SAYISI }; // tarayıcı: mantik.js önce yüklenir
}

// Saf doğrulama: depolamaya dokunmaz. Çözülmüş (parse edilmiş) kaydın geçerli olup olmadığını söyler.
function durumGecerliMi(veri, kurallar = kurallariAl()) {
  if (veri === null || typeof veri !== "object" || Array.isArray(veri)) return false;
  if (veri.surum !== DURUM_SURUMU) return false;
  if (typeof veri.kazanmaBildirildi !== "boolean") return false;
  if (typeof veri.puan !== "number" || !Number.isFinite(veri.puan) || veri.puan < 0) return false;
  const { BOYUT, ASAMA_SAYISI } = kurallar;
  if (!Array.isArray(veri.tahta) || veri.tahta.length !== BOYUT) return false;
  let tasVar = false;
  for (const satir of veri.tahta) {
    if (!Array.isArray(satir) || satir.length !== BOYUT) return false;
    for (const hucre of satir) {
      // 0 (boş) ya da 1..ASAMA_SAYISI arası tam sayı olmalı
      if (!Number.isInteger(hucre) || hucre < 0 || hucre > ASAMA_SAYISI) return false;
      if (hucre !== 0) tasVar = true;
    }
  }
  return tasVar; // tamamen boş tahta oyunda hiç oluşmaz, bozuk sayılır
}

// Metni çözer ve doğrularsa kaydı döndürür; bozuksa null
function durumCoz(metin, kurallar) {
  if (typeof metin !== "string" || metin === "") return null;
  let veri;
  try {
    veri = JSON.parse(metin);
  } catch (hata) {
    return null;
  }
  return durumGecerliMi(veri, kurallar) ? veri : null;
}

function varsayilanDepo() {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch (hata) {
    return null; // erişim bile hata verebilir (gizli mod, izin vb.)
  }
}

function skorDeposuKur(depo = varsayilanDepo()) {
  let bellek = 0; // depo çalışmazsa skor sadece sayfa açıkken burada durur

  function oku() {
    let ham = null;
    try {
      if (depo) ham = depo.getItem(SKOR_ANAHTARI);
    } catch (hata) {
      return bellek;
    }
    const sayi = Number(ham);
    // Kayıt yok (null), boş ya da sayı değilse 0
    if (ham === null || ham === "" || !Number.isFinite(sayi) || sayi < 0) return Math.max(0, bellek);
    return Math.max(sayi, bellek);
  }

  function yaz(skor) {
    bellek = Math.max(bellek, skor);
    try {
      if (depo) depo.setItem(SKOR_ANAHTARI, String(skor));
    } catch (hata) {
      // yazılamadı: bellekte kalır, oyun devam eder
    }
  }

  // Skor mevcut rekoru geçtiyse kaydeder; güncel rekoru döndürür
  function guncelle(skor) {
    const mevcut = oku();
    if (skor > mevcut) {
      yaz(skor);
      return skor;
    }
    return mevcut;
  }

  // --- Oyun durumu (kaldığı yerden devam). Hatalar sessizce atlanır. ---

  function durumSil() {
    try {
      if (depo && typeof depo.removeItem === "function") depo.removeItem(DURUM_ANAHTARI);
    } catch (hata) {
      // silinemedi: oyun devam eder
    }
  }

  // durum: { tahta, puan, kazandi }. Geçersizse hiçbir şey yazmaz.
  function durumKaydet(durum) {
    const kayit = {
      surum: DURUM_SURUMU,
      tahta: durum.tahta,
      puan: durum.puan,
      kazanmaBildirildi: durum.kazandi,
    };
    if (!durumGecerliMi(kayit)) return;
    try {
      if (depo) depo.setItem(DURUM_ANAHTARI, JSON.stringify(kayit));
    } catch (hata) {
      // yazılamadı: sessizce atla
    }
  }

  // Geçerli kaydı { surum, tahta, puan, kazanmaBildirildi } olarak döndürür; yoksa ya da bozuksa null.
  // Bozuk kayıt silinir.
  function durumOku() {
    let ham = null;
    try {
      if (depo) ham = depo.getItem(DURUM_ANAHTARI);
    } catch (hata) {
      return null;
    }
    if (ham === null || ham === undefined) return null;
    const kayit = durumCoz(ham);
    if (kayit === null) durumSil();
    return kayit;
  }

  // Her geçerli hamleden sonra çağrılır: oyun bittiyse kaydı siler, bitmediyse kaydeder
  function kayitGuncelle(durum) {
    if (durum.bitti) durumSil();
    else durumKaydet(durum);
  }

  return { oku, guncelle, durumKaydet, durumOku, durumSil, kayitGuncelle };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SKOR_ANAHTARI, DURUM_ANAHTARI, skorDeposuKur, durumGecerliMi, durumCoz };
}
