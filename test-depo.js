// Depo testleri. Çalıştır: node test-depo.js (sahte depolama ile)
const assert = require("assert");
const { SKOR_ANAHTARI, skorDeposuKur } = require("./js/depo.js");

let gecen = 0;
let kalan = 0;
function test(ad, fn) {
  try {
    fn();
    gecen++;
    console.log("  geçti  " + ad);
  } catch (e) {
    kalan++;
    console.log("  KALDI  " + ad + "\n         " + e.message.split("\n")[0]);
  }
}

// Sahte localStorage: sadece getItem ve setItem
function sahteDepo(baslangic = {}) {
  const veri = { ...baslangic };
  return {
    veri,
    getItem: (k) => (k in veri ? veri[k] : null),
    setItem: (k, v) => { veri[k] = String(v); },
  };
}
// Her çağrıda hata fırlatan depo
const bozukDepo = {
  getItem() { throw new Error("erişim yok"); },
  setItem() { throw new Error("kota doldu"); },
};

console.log("Okuma");
test("kayıt yoksa 0", () => {
  assert.strictEqual(skorDeposuKur(sahteDepo()).oku(), 0);
});
test("kayıtlı sayıyı okur", () => {
  assert.strictEqual(skorDeposuKur(sahteDepo({ [SKOR_ANAHTARI]: "1234" })).oku(), 1234);
});
test("sayı olmayan değer 0", () => {
  assert.strictEqual(skorDeposuKur(sahteDepo({ [SKOR_ANAHTARI]: "abc" })).oku(), 0);
});
test("boş metin 0", () => {
  assert.strictEqual(skorDeposuKur(sahteDepo({ [SKOR_ANAHTARI]: "" })).oku(), 0);
});
test("negatif ya da sonsuz değer 0", () => {
  assert.strictEqual(skorDeposuKur(sahteDepo({ [SKOR_ANAHTARI]: "-5" })).oku(), 0);
  assert.strictEqual(skorDeposuKur(sahteDepo({ [SKOR_ANAHTARI]: "Infinity" })).oku(), 0);
});

console.log("Yazma");
test("rekoru geçen skor yazılır ve okunur", () => {
  const d = sahteDepo();
  const depo = skorDeposuKur(d);
  assert.strictEqual(depo.guncelle(500), 500);
  assert.strictEqual(d.veri[SKOR_ANAHTARI], "500");
  assert.strictEqual(depo.oku(), 500);
});
test("rekoru geçmeyen skor yazılmaz", () => {
  const d = sahteDepo({ [SKOR_ANAHTARI]: "900" });
  const depo = skorDeposuKur(d);
  assert.strictEqual(depo.guncelle(300), 900);
  assert.strictEqual(d.veri[SKOR_ANAHTARI], "900");
});
test("yeni depo aynı kaydı görür (sayfa yenileme)", () => {
  const d = sahteDepo();
  skorDeposuKur(d).guncelle(777);
  assert.strictEqual(skorDeposuKur(d).oku(), 777);
});
test("bozuk kayıt varken yeni skor üzerine yazar", () => {
  const d = sahteDepo({ [SKOR_ANAHTARI]: "bozuk" });
  assert.strictEqual(skorDeposuKur(d).guncelle(40), 40);
  assert.strictEqual(d.veri[SKOR_ANAHTARI], "40");
});

console.log("Depolama çalışmıyor");
test("hata fırlatan depoda çökmez, skor bellekte tutulur", () => {
  const depo = skorDeposuKur(bozukDepo);
  assert.strictEqual(depo.oku(), 0);
  assert.strictEqual(depo.guncelle(120), 120);
  assert.strictEqual(depo.guncelle(60), 120);
  assert.strictEqual(depo.oku(), 120);
});
test("depo yoksa (null) çökmez, bellekte tutulur", () => {
  const depo = skorDeposuKur(null);
  assert.strictEqual(depo.guncelle(8), 8);
  assert.strictEqual(depo.oku(), 8);
});
test("sadece yazma bozuksa bellek skoru korur", () => {
  const yazmaBozuk = { getItem: () => null, setItem() { throw new Error("kota"); } };
  const depo = skorDeposuKur(yazmaBozuk);
  depo.guncelle(55);
  assert.strictEqual(depo.oku(), 55);
});

console.log("\n" + gecen + " geçti, " + kalan + " kaldı");
process.exit(kalan ? 1 : 0);
