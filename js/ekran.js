// Tahtayı çizer. Sayıyı harfe çeviren tek yer burasıdır.
const HARFLER = ["A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H"];

const KAYMA_MS = 120; // style.css'teki geçiş süresiyle aynı olmalı

// Taşlar sabit konumlu elementlerdir; konum --r ve --c değişkenleriyle verilir,
// CSS bunu transform: translate'e çevirir (hücre boyutu CSS'ten gelir, piksel yok).
let katmanEl = null; // taşların durduğu katman
let taslar = new Map(); // hücre indeksi -> taş elementi
let bekleyen = null; // sürmekte olan animasyon

function azHareketMi() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Boş hücreleri ve taş katmanını bir kez kurar
function tahtaKur(tahtaEl) {
  if (katmanEl && katmanEl.parentNode === tahtaEl) return;
  tahtaEl.textContent = "";
  for (let i = 0; i < BOYUT * BOYUT; i++) {
    const bos = document.createElement("div");
    bos.className = "hucre";
    tahtaEl.appendChild(bos);
  }
  katmanEl = document.createElement("div");
  katmanEl.className = "katman";
  tahtaEl.appendChild(katmanEl);
  taslar = new Map();
  bekleyen = null;
}

function konumVer(el, indeks) {
  el.style.setProperty("--r", Math.floor(indeks / BOYUT));
  el.style.setProperty("--c", indeks % BOYUT);
}

// Yeni bir taş elementi yapar ve katmana koyar. İçteki "yuz" renk ve harfi taşır;
// zıplama/beliriş animasyonları içte döner, dıştaki konum transform'una karışmaz.
function tasYap(deger, indeks) {
  const dis = document.createElement("div");
  dis.className = "tas-yer";
  konumVer(dis, indeks);
  const yuz = document.createElement("div");
  yuz.className = "hucre tas a" + deger;
  yuz.textContent = HARFLER[deger - 1];
  dis.appendChild(yuz);
  katmanEl.appendChild(dis);
  taslar.set(indeks, dis);
  return dis;
}

// Sürmekte olan animasyonu hemen tamamlar. zipla=true ise birleşen taş zıplar.
function bitir(zipla) {
  if (!bekleyen) return false;
  const b = bekleyen;
  bekleyen = null;
  clearTimeout(b.zaman);
  for (const el of b.silinecek) el.remove();
  for (const [indeks, deger] of b.birlesen) {
    const yuz = tasYap(deger, indeks).firstChild;
    if (zipla) {
      yuz.classList.add("zipla");
      yuz.addEventListener("animationend", () => yuz.classList.remove("zipla"), { once: true });
    }
  }
  if (b.yeniEl) b.yeniEl.firstChild.classList.remove("belir");
  return true;
}

// Tahtayı (0..10 sayıları) animasyonsuz, baştan çizer (yeni oyun, ilk açılış)
function tahtayiCiz(tahtaEl, tahta) {
  tahtaKur(tahtaEl);
  if (bekleyen) clearTimeout(bekleyen.zaman);
  bekleyen = null;
  katmanEl.textContent = "";
  taslar = new Map();
  tahta.forEach((satir, r) => {
    satir.forEach((deger, c) => {
      if (deger !== 0) tasYap(deger, r * BOYUT + c);
    });
  });
}

// Hamleyi animasyonla çizer: kayma, birleşmede zıplama, yeni taşta beliriş.
// hareketler ve yeniTas mantık katmanından gelir; tahta hamle sonrası tahtadır.
function hamleyiCiz(tahtaEl, hareketler, tahta, yeniTas) {
  tahtaKur(tahtaEl);
  // Önceki animasyon sürüyorsa hemen bitir; girdi yutulmaz
  if (bitir(false)) {
    for (const el of taslar.values()) el.style.transition = "none";
    void katmanEl.offsetWidth; // tarayıcı son konumu uygulasın
    for (const el of taslar.values()) el.style.transition = "";
  }
  // Ekran tahtayla uyuşmuyorsa ya da hareket azaltılmışsa anında çiz
  if (azHareketMi() || !hareketler.every((h) => taslar.has(h.kaynak))) {
    tahtayiCiz(tahtaEl, tahta);
    return;
  }

  const yeniTaslar = new Map();
  const silinecek = [];
  const birlesen = new Map(); // hedef indeks -> birleşmiş taşın değeri
  for (const h of hareketler) {
    const el = taslar.get(h.kaynak);
    konumVer(el, h.hedef); // CSS geçişi taşı kaydırır
    if (h.birlesti) {
      silinecek.push(el);
      birlesen.set(h.hedef, tahta[Math.floor(h.hedef / BOYUT)][h.hedef % BOYUT]);
    } else {
      yeniTaslar.set(h.hedef, el);
    }
  }
  taslar = yeniTaslar;
  const yeniEl = yeniTas === null
    ? null
    : tasYap(tahta[Math.floor(yeniTas / BOYUT)][yeniTas % BOYUT], yeniTas);
  if (yeniEl) yeniEl.firstChild.classList.add("belir");

  bekleyen = { silinecek, birlesen, yeniEl, zaman: setTimeout(() => bitir(true), KAYMA_MS) };
}

function puaniYaz(puanEl, puan) {
  puanEl.textContent = puan;
}

function enYuksekYaz(enYuksekEl, skor) {
  enYuksekEl.textContent = skor;
}
