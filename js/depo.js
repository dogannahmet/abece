// En yüksek skoru saklar. Oyun kurallarını bilmez.
// Depolama dışarıdan verilir (varsayılan localStorage); Node'da sahte nesneyle test edilir.
const SKOR_ANAHTARI = "abeceEnYuksekSkor";

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

  return { oku, guncelle };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SKOR_ANAHTARI, skorDeposuKur };
}
