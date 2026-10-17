// Depo testleri. Çalıştır: node test-depo.js (sahte depolama ile)
const assert = require("assert");
const { SKOR_ANAHTARI, DURUM_ANAHTARI, skorDeposuKur, durumGecerliMi, durumCoz } = require("./js/depo.js");

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
    removeItem: (k) => { delete veri[k]; },
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

// ---- Oyun durumu kaydı ----
const gecerliTahta = () => [[1, 2, 0, 0], [0, 3, 0, 0], [0, 0, 4, 0], [0, 0, 0, 1]];
const gecerliKayit = () => ({ surum: 1, tahta: gecerliTahta(), puan: 120, kazanmaBildirildi: false });
const oyunDurumu = () => ({ tahta: gecerliTahta(), puan: 120, kazandi: false, bitti: false });

console.log("Doğrulama (saf)");
test("geçerli kayıt kabul edilir", () => assert.strictEqual(durumGecerliMi(gecerliKayit()), true));
test("kazanmaBildirildi true da geçerli", () => {
  const k = gecerliKayit(); k.kazanmaBildirildi = true;
  assert.strictEqual(durumGecerliMi(k), true);
});
test("puan 0 geçerli", () => {
  const k = gecerliKayit(); k.puan = 0;
  assert.strictEqual(durumGecerliMi(k), true);
});
test("uç değerler 0 ve 10 geçerli", () => {
  const k = gecerliKayit(); k.tahta[0][0] = 10; k.tahta[3][3] = 0;
  assert.strictEqual(durumGecerliMi(k), true);
});
test("yanlış sürüm (2) ve sürümsüz kayıt reddedilir", () => {
  const k = gecerliKayit(); k.surum = 2;
  assert.strictEqual(durumGecerliMi(k), false);
  const s2 = gecerliKayit(); delete s2.surum;
  assert.strictEqual(durumGecerliMi(s2), false);
});
test("3x4 tahta (3 satır) reddedilir", () => {
  const k = gecerliKayit(); k.tahta.pop();
  assert.strictEqual(durumGecerliMi(k), false);
});
test("4x3 tahta (satır 3 hücreli) reddedilir", () => {
  const k = gecerliKayit(); k.tahta[2].pop();
  assert.strictEqual(durumGecerliMi(k), false);
});
test("5 satırlı tahta reddedilir", () => {
  const k = gecerliKayit(); k.tahta.push([0, 0, 0, 0]);
  assert.strictEqual(durumGecerliMi(k), false);
});
test("tahta dizi değilse ya da satır dizi değilse reddedilir", () => {
  const k = gecerliKayit(); k.tahta = "abcd";
  assert.strictEqual(durumGecerliMi(k), false);
  const s2 = gecerliKayit(); s2.tahta[1] = null;
  assert.strictEqual(durumGecerliMi(s2), false);
});
test("hücre 11, -1, 2.5, yazı, null, NaN reddedilir", () => {
  for (const kotu of [11, -1, 2.5, "3", null, NaN, Infinity, true]) {
    const k = gecerliKayit(); k.tahta[1][1] = kotu;
    assert.strictEqual(durumGecerliMi(k), false, "hücre: " + String(kotu));
  }
});
test("puan yazı, negatif, NaN, sonsuz ya da yok ise reddedilir", () => {
  for (const kotu of ["120", -1, NaN, Infinity, null, undefined]) {
    const k = gecerliKayit(); k.puan = kotu;
    assert.strictEqual(durumGecerliMi(k), false, "puan: " + String(kotu));
  }
});
test("kazanmaBildirildi boolean değilse reddedilir", () => {
  for (const kotu of ["true", 1, 0, null, undefined]) {
    const k = gecerliKayit(); k.kazanmaBildirildi = kotu;
    assert.strictEqual(durumGecerliMi(k), false, "kazanma: " + String(kotu));
  }
});
test("tamamen boş tahta reddedilir", () => {
  const k = gecerliKayit(); k.tahta = k.tahta.map((s) => s.map(() => 0));
  assert.strictEqual(durumGecerliMi(k), false);
});
test("kayıt nesne değilse reddedilir (null, dizi, yazı, sayı)", () => {
  for (const kotu of [null, [], "x", 5, undefined]) assert.strictEqual(durumGecerliMi(kotu), false);
});
test("durumCoz: bozuk JSON ve boş metin null", () => {
  assert.strictEqual(durumCoz("{bozuk"), null);
  assert.strictEqual(durumCoz(""), null);
  assert.strictEqual(durumCoz(null), null);
  assert.strictEqual(durumCoz("123"), null);
});

console.log("Durum kaydı (depo)");
test("kayıt yoksa durumOku null", () => {
  assert.strictEqual(skorDeposuKur(sahteDepo()).durumOku(), null);
});
test("gidiş-dönüş: kaydedilen durum aynen okunur", () => {
  const depo = skorDeposuKur(sahteDepo());
  const d = oyunDurumu(); d.kazandi = true;
  depo.durumKaydet(d);
  assert.deepStrictEqual(depo.durumOku(), { surum: 1, tahta: d.tahta, puan: 120, kazanmaBildirildi: true });
});
test("yeni depo aynı kaydı görür (sayfa yenileme)", () => {
  const d = sahteDepo();
  skorDeposuKur(d).durumKaydet(oyunDurumu());
  assert.deepStrictEqual(skorDeposuKur(d).durumOku().tahta, gecerliTahta());
});
test("kaydedilen JSON doğru anahtarda ve biçimde", () => {
  const d = sahteDepo();
  skorDeposuKur(d).durumKaydet(oyunDurumu());
  const ham = JSON.parse(d.veri[DURUM_ANAHTARI]);
  assert.deepStrictEqual(Object.keys(ham).sort(), ["kazanmaBildirildi", "puan", "surum", "tahta"]);
  assert.strictEqual(ham.surum, 1);
  assert.strictEqual(DURUM_ANAHTARI, "abeceOyunDurumu");
});
test("okunan kayıt, kaydedilen nesneyle paylaşılmaz (kopya)", () => {
  const depo = skorDeposuKur(sahteDepo());
  const d = oyunDurumu();
  depo.durumKaydet(d);
  const okunan = depo.durumOku();
  okunan.tahta[0][0] = 9;
  assert.strictEqual(d.tahta[0][0], 1);
});
test("bozuk JSON: null döner ve kayıt silinir", () => {
  const d = sahteDepo({ [DURUM_ANAHTARI]: "{bozuk" });
  assert.strictEqual(skorDeposuKur(d).durumOku(), null);
  assert.ok(!(DURUM_ANAHTARI in d.veri));
});
test("yanlış sürüm: null döner ve kayıt silinir", () => {
  const k = gecerliKayit(); k.surum = 2;
  const d = sahteDepo({ [DURUM_ANAHTARI]: JSON.stringify(k) });
  assert.strictEqual(skorDeposuKur(d).durumOku(), null);
  assert.ok(!(DURUM_ANAHTARI in d.veri));
});
test("3x4 tahta kaydı: null döner", () => {
  const k = gecerliKayit(); k.tahta.pop();
  const d = sahteDepo({ [DURUM_ANAHTARI]: JSON.stringify(k) });
  assert.strictEqual(skorDeposuKur(d).durumOku(), null);
});
test("hücre 11 / -1 / 2.5 kaydı: null döner", () => {
  for (const kotu of [11, -1, 2.5]) {
    const k = gecerliKayit(); k.tahta[0][1] = kotu;
    const d = sahteDepo({ [DURUM_ANAHTARI]: JSON.stringify(k) });
    assert.strictEqual(skorDeposuKur(d).durumOku(), null, "hücre: " + kotu);
  }
});
test("puan yazı olan kayıt: null döner", () => {
  const k = gecerliKayit(); k.puan = "yüz";
  const d = sahteDepo({ [DURUM_ANAHTARI]: JSON.stringify(k) });
  assert.strictEqual(skorDeposuKur(d).durumOku(), null);
});
test("boş metin kaydı: null döner", () => {
  const d = sahteDepo({ [DURUM_ANAHTARI]: "" });
  assert.strictEqual(skorDeposuKur(d).durumOku(), null);
});
test("geçersiz oyun durumu kaydedilmez", () => {
  const d = sahteDepo();
  const kotu = oyunDurumu(); kotu.tahta.pop();
  skorDeposuKur(d).durumKaydet(kotu);
  assert.ok(!(DURUM_ANAHTARI in d.veri));
});
test("durumSil kaydı siler", () => {
  const d = sahteDepo();
  const depo = skorDeposuKur(d);
  depo.durumKaydet(oyunDurumu());
  depo.durumSil();
  assert.strictEqual(depo.durumOku(), null);
});

console.log("Oyun bitince silme");
test("kayitGuncelle: oyun sürüyorsa kaydeder", () => {
  const d = sahteDepo();
  skorDeposuKur(d).kayitGuncelle(oyunDurumu());
  assert.ok(DURUM_ANAHTARI in d.veri);
});
test("kayitGuncelle: oyun bittiyse kaydı siler", () => {
  const d = sahteDepo();
  const depo = skorDeposuKur(d);
  depo.kayitGuncelle(oyunDurumu());
  const bitmis = oyunDurumu(); bitmis.bitti = true;
  depo.kayitGuncelle(bitmis);
  assert.ok(!(DURUM_ANAHTARI in d.veri));
  assert.strictEqual(depo.durumOku(), null);
});

console.log("Skor ile durum bağımsız");
test("durumSil ve bozuk kayıt temizliği en yüksek skora dokunmaz", () => {
  const d = sahteDepo({ [SKOR_ANAHTARI]: "900", [DURUM_ANAHTARI]: "{bozuk" });
  const depo = skorDeposuKur(d);
  depo.durumOku();
  depo.durumSil();
  assert.strictEqual(d.veri[SKOR_ANAHTARI], "900");
  assert.strictEqual(depo.oku(), 900);
});
test("durum kaydı en yüksek skoru değiştirmez", () => {
  const d = sahteDepo({ [SKOR_ANAHTARI]: "900" });
  skorDeposuKur(d).durumKaydet(oyunDurumu());
  assert.strictEqual(d.veri[SKOR_ANAHTARI], "900");
});

console.log("Durum kaydı: depolama çalışmıyor");
test("hata fırlatan depoda durum işlevleri çökmez", () => {
  const depo = skorDeposuKur(bozukDepo);
  assert.doesNotThrow(() => depo.durumKaydet(oyunDurumu()));
  assert.strictEqual(depo.durumOku(), null);
  assert.doesNotThrow(() => depo.durumSil());
  assert.doesNotThrow(() => depo.kayitGuncelle(oyunDurumu()));
});
test("depo yoksa (null) durum işlevleri çökmez", () => {
  const depo = skorDeposuKur(null);
  assert.doesNotThrow(() => depo.durumKaydet(oyunDurumu()));
  assert.strictEqual(depo.durumOku(), null);
  assert.doesNotThrow(() => depo.durumSil());
});
test("removeItem'ı olmayan ya da hata veren depo çökmez", () => {
  const eksik = { getItem: () => "{bozuk", setItem() {} };
  assert.strictEqual(skorDeposuKur(eksik).durumOku(), null);
  const hatali = { getItem: () => "{bozuk", setItem() {}, removeItem() { throw new Error("yok"); } };
  assert.strictEqual(skorDeposuKur(hatali).durumOku(), null);
});

console.log("\n" + gecen + " geçti, " + kalan + " kaldı");
process.exit(kalan ? 1 : 0);
