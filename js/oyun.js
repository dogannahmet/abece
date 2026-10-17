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

document.addEventListener("keydown", (olay) => {
  const yon = YONLER[olay.key];
  if (!yon) return;
  olay.preventDefault(); // ok tuşları sayfayı kaydırmasın
  const sonuc = hamleYap(durum, yon);
  if (!sonuc.hareket) return;
  goster();
  if (sonuc.kazanmaYeni) mesajEl.textContent = "Tebrikler, H harfine ulaştın! İstersen devam edebilirsin.";
  if (durum.bitti) mesajEl.textContent = "Oyun bitti. Yeni oyun ile tekrar dene.";
});

document.getElementById("yeni-oyun").addEventListener("click", (olay) => {
  olay.currentTarget.blur(); // odak düğmede kalmasın
  yeniOyunBaslat();
});

yeniOyunBaslat();
