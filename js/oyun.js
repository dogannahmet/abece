// Ok tuşlarını dinler, mantık ile ekranı bağlar.
const YONLER = {
  ArrowLeft: "sol",
  ArrowRight: "sag",
  ArrowUp: "yukari",
  ArrowDown: "asagi",
};

const tahtaEl = document.getElementById("tahta");
const puanEl = document.getElementById("puan");
const enYuksekEl = document.getElementById("en-yuksek");
const mesajEl = document.getElementById("mesaj");
const skorDeposu = skorDeposuKur(); // en yüksek skor (yeni oyun sıfırlamaz)
let durum;

function goster() {
  tahtayiCiz(tahtaEl, durum.tahta);
  puaniYaz(puanEl, durum.puan);
  // Puan rekoru geçince canlı güncellenir ve depoya yazılır
  enYuksekYaz(enYuksekEl, skorDeposu.guncelle(durum.puan));
}

function yeniOyunBaslat() {
  durum = yeniOyun();
  mesajEl.textContent = "";
  goster();
}

// Klavye ve dokunmatik aynı yolu kullanır
function hamleUygula(yon) {
  const sonuc = hamleYap(durum, yon);
  if (!sonuc.hareket) return;
  goster();
  if (sonuc.kazanmaYeni) mesajEl.textContent = "Tebrikler, H harfine ulaştın! İstersen devam edebilirsin.";
  if (durum.bitti) mesajEl.textContent = "Oyun bitti. Yeni oyun ile tekrar dene.";
}

document.addEventListener("keydown", (olay) => {
  const yon = YONLER[olay.key];
  if (!yon) return;
  olay.preventDefault(); // ok tuşları sayfayı kaydırmasın
  hamleUygula(yon);
});

// Dokunmatik: tek parmakla kaydırma
const KAYDIRMA_ESIGI = 30; // piksel
let dokunmaBaslangic = null; // { x, y } ya da null (çok parmaklıysa iptal)

tahtaEl.addEventListener("touchstart", (olay) => {
  if (olay.touches.length !== 1) {
    dokunmaBaslangic = null; // ikinci parmak gelince hareket iptal
    return;
  }
  dokunmaBaslangic = { x: olay.touches[0].clientX, y: olay.touches[0].clientY };
});

tahtaEl.addEventListener("touchend", (olay) => {
  // Hâlâ ekranda parmak varsa ya da başlangıç iptal edildiyse yok say
  if (!dokunmaBaslangic || olay.touches.length !== 0 || olay.changedTouches.length !== 1) {
    if (olay.touches.length === 0) dokunmaBaslangic = null;
    return;
  }
  const son = olay.changedTouches[0];
  const yon = yonBul(son.clientX - dokunmaBaslangic.x, son.clientY - dokunmaBaslangic.y, KAYDIRMA_ESIGI);
  dokunmaBaslangic = null;
  if (yon) hamleUygula(yon);
});

tahtaEl.addEventListener("touchcancel", () => {
  dokunmaBaslangic = null;
});

document.getElementById("yeni-oyun").addEventListener("click", (olay) => {
  olay.currentTarget.blur(); // odak düğmede kalmasın
  yeniOyunBaslat();
});

yeniOyunBaslat();
