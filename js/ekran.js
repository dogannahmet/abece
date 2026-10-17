// Tahtayı çizer. Sayıyı harfe çeviren tek yer burasıdır.
const HARFLER = ["A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H"];

// Tahtayı (0..10 sayıları) ekrana yeniden çizer
function tahtayiCiz(tahtaEl, tahta) {
  tahtaEl.textContent = "";
  for (const satir of tahta) {
    for (const deger of satir) {
      const hucre = document.createElement("div");
      if (deger === 0) {
        hucre.className = "hucre";
      } else {
        hucre.className = "hucre tas a" + deger;
        hucre.textContent = HARFLER[deger - 1];
      }
      tahtaEl.appendChild(hucre);
    }
  }
}

function puaniYaz(puanEl, puan) {
  puanEl.textContent = puan;
}
