// Mantık testleri. Çalıştır: node test-mantik.js (kütüphane yok)
const assert = require("assert");
const M = require("./js/mantik.js");

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
const sabit = (...degerler) => { // sırayla sabit "rastgele" sayılar
  let i = 0;
  return () => degerler[i++ % degerler.length];
};

console.log("Yönler");
test("sola kaydırma", () => {
  const t = [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").tahta[0], [1, 0, 0, 0]);
});
test("sağa kaydırma", () => {
  const t = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sag").tahta[0], [0, 0, 0, 1]);
});
test("yukarı kaydırma", () => {
  const t = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 3, 0, 0]];
  assert.strictEqual(M.kaydir(t, "yukari").tahta[0][1], 3);
});
test("aşağı kaydırma", () => {
  const t = [[0, 0, 4, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.strictEqual(M.kaydir(t, "asagi").tahta[3][2], 4);
});
test("kaydır girdi tahtasını değiştirmez", () => {
  const t = [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  M.kaydir(t, "sol");
  assert.strictEqual(t[0][3], 1);
});
test("geçersiz yön hata verir", () => {
  assert.throws(() => M.kaydir(M.bosTahta(), "çapraz"));
});

console.log("Birleşme");
test("iki aynı taş bir üst aşama olur", () => {
  const t = [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const s = M.kaydir(t, "sol");
  assert.deepStrictEqual(s.tahta[0], [2, 0, 0, 0]);
});
test("puan = 2 üzeri yeni aşama (A+A=B -> 4)", () => {
  const t = [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.strictEqual(M.kaydir(t, "sol").puan, 4);
});
test("puan C oluşunca 8", () => {
  const t = [[2, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.strictEqual(M.kaydir(t, "sol").puan, 8);
});
test("farklı aşamalar birleşmez", () => {
  const t = [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").tahta[0], [1, 2, 0, 0]);
});
test("A A A A -> B B (zincirleme birleşme yok)", () => {
  const t = [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").tahta[0], [2, 2, 0, 0]);
});
test("B A A -> B B (yeni oluşan taş aynı hamlede tekrar birleşmez)", () => {
  const t = [[2, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").tahta[0], [2, 2, 0, 0]);
});
test("A A A -> B A (soldaki çift birleşir)", () => {
  const t = [[1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").tahta[0], [2, 1, 0, 0]);
});
test("sağa A A A -> A B (duvara yakın çift birleşir)", () => {
  const t = [[0, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sag").tahta[0], [0, 0, 1, 2]);
});
test("aralı aynı taşlar birleşir (A 0 A)", () => {
  const t = [[1, 0, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").tahta[0], [2, 0, 0, 0]);
});

console.log("Hareketsiz hamle");
test("hareket yoksa hareket=false", () => {
  const t = [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.strictEqual(M.kaydir(t, "sol").hareket, false);
});
test("hareketsiz hamlede yeni taş düşmez, puan değişmez", () => {
  const durum = { tahta: [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 7, kazandi: false, bitti: false };
  const once = JSON.stringify(durum);
  const s = M.hamleYap(durum, "sol", sabit(0));
  assert.strictEqual(s.hareket, false);
  assert.strictEqual(JSON.stringify(durum), once);
});
test("geçerli hamlede tam bir yeni taş düşer", () => {
  const durum = { tahta: [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazandi: false, bitti: false };
  M.hamleYap(durum, "sol", sabit(0, 0));
  assert.strictEqual(durum.tahta.flat().filter((x) => x !== 0).length, 2);
});

console.log("Yeni taş");
test("%90 A: rastgele < 0.9 ise A", () => {
  assert.strictEqual(M.yeniTasEkle(M.bosTahta(), sabit(0, 0.89)).deger, 1);
});
test("%10 B: rastgele >= 0.9 ise B", () => {
  assert.strictEqual(M.yeniTasEkle(M.bosTahta(), sabit(0, 0.9)).deger, 2);
});
test("sadece boş hücreye düşer", () => {
  const t = M.bosTahta().map((s) => s.map(() => 3));
  t[2][1] = 0;
  const y = M.yeniTasEkle(t, sabit(0.5, 0));
  assert.deepStrictEqual(y.konum, [2, 1]);
});
test("tahta doluysa null", () => {
  assert.strictEqual(M.yeniTasEkle(M.bosTahta().map((s) => s.map(() => 1))), null);
});
test("yeni oyun 2 taşla başlar, taşlar A veya B", () => {
  const o = M.yeniOyun();
  const taslar = o.tahta.flat().filter((x) => x !== 0);
  assert.strictEqual(taslar.length, 2);
  assert.ok(taslar.every((x) => x === 1 || x === 2));
  assert.strictEqual(o.puan, 0);
});
test("dağılım yaklaşık %90 A / %10 B", () => {
  let b = 0;
  for (let i = 0; i < 20000; i++) if (M.yeniTasEkle(M.bosTahta()).deger === 2) b++;
  assert.ok(b > 1700 && b < 2300, "B sayısı: " + b);
});

console.log("En üst aşama (H)");
const H = M.ASAMA_SAYISI;
test("aşama sayısı 10", () => assert.strictEqual(H, 10));
test("H ile H birleşmez", () => {
  const t = [[H, H, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const s = M.kaydir(t, "sol");
  assert.deepStrictEqual(s.tahta[0], [H, H, 0, 0]);
  assert.strictEqual(s.puan, 0);
  assert.strictEqual(s.hareket, false);
});
test("Ğ + Ğ = H ve puan 2^10", () => {
  const t = [[H - 1, H - 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const s = M.kaydir(t, "sol");
  assert.deepStrictEqual(s.tahta[0], [H, 0, 0, 0]);
  assert.strictEqual(s.puan, 1024);
  assert.strictEqual(s.enUstOlustu, true);
});

console.log("Kazanma");
test("ilk H oluşunca kazanma bir kez bildirilir", () => {
  const durum = { tahta: [[H - 1, H - 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazandi: false, bitti: false };
  const s1 = M.hamleYap(durum, "sol", sabit(0, 0));
  assert.strictEqual(s1.kazanmaYeni, true);
  assert.strictEqual(durum.kazandi, true);
});
test("ikinci H oluşunca tekrar bildirilmez, oyun devam eder", () => {
  const durum = { tahta: [[H - 1, H - 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazandi: true, bitti: false };
  const s = M.hamleYap(durum, "sol", sabit(0, 0));
  assert.strictEqual(s.hareket, true);
  assert.strictEqual(s.kazanmaYeni, false);
  assert.strictEqual(durum.bitti, false);
});

console.log("Oyun bitişi");
// Satranç tahtası düzeni: komşular hiç eşit değil
const kilitli = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
test("dolu ve birleşme yoksa oyun biter", () => {
  assert.strictEqual(M.bittiMi(kilitli), true);
});
test("dolu ama birleşme varsa bitmez", () => {
  const t = kilitli.map((s) => s.slice());
  t[0][1] = 1;
  assert.strictEqual(M.bittiMi(t), false);
});
test("boş hücre varsa bitmez", () => {
  const t = kilitli.map((s) => s.slice());
  t[3][3] = 0;
  assert.strictEqual(M.bittiMi(t), false);
});
test("dolu tahtada yan yana H H varsa hâlâ biter", () => {
  const t = [[H, H, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2], [2, 1, 2, 1]];
  assert.strictEqual(M.bittiMi(t), true);
});
test("son hamle tahtayı kilitlerse bitti=true olur", () => {
  // Sola kaydırınca ilk satır birleşir, tek boş hücreye A düşer ve tahta kilitlenir
  const t = [[1, 1, 3, 4], [3, 2, 1, 2], [2, 3, 2, 3], [3, 2, 3, 2]];
  const durum = { tahta: t, puan: 0, kazandi: false, bitti: false };
  const s = M.hamleYap(durum, "sol", sabit(0, 0));
  assert.strictEqual(s.hareket, true);
  assert.deepStrictEqual(durum.tahta[0], [2, 3, 4, 1]);
  assert.strictEqual(durum.bitti, true);
});
test("bitmiş oyunda hamle işlemez", () => {
  const durum = { tahta: kilitli.map((s) => s.slice()), puan: 5, kazandi: false, bitti: true };
  assert.strictEqual(M.hamleYap(durum, "sol").hareket, false);
});

console.log("Hareketler listesi");
// Karar: hareket etmeyen taş da listede, kaynak = hedef. Hücre indeksi = satır * 4 + sütun.
const bul = (liste, kaynak) => liste.find((h) => h.kaynak === kaynak);
test("sola kayma: 3 -> 0, birleşmedi", () => {
  const t = [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  assert.deepStrictEqual(M.kaydir(t, "sol").hareketler, [{ kaynak: 3, hedef: 0, birlesti: false }]);
});
test("birleşen iki taşın hedefi aynı ve ikisi de birlesti=true", () => {
  const t = [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const h = M.kaydir(t, "sol").hareketler;
  assert.strictEqual(h.length, 2);
  assert.deepStrictEqual(bul(h, 0), { kaynak: 0, hedef: 0, birlesti: true });
  assert.deepStrictEqual(bul(h, 1), { kaynak: 1, hedef: 0, birlesti: true });
});
test("A A A A: hedefler 0,0,1,1 (zincirleme yok)", () => {
  const t = [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const h = M.kaydir(t, "sol").hareketler;
  assert.deepStrictEqual(h.map((x) => x.hedef), [0, 0, 1, 1]);
  assert.ok(h.every((x) => x.birlesti));
});
test("B A A: B yerinde, A'lar 1'e birleşir", () => {
  const t = [[2, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const h = M.kaydir(t, "sol").hareketler;
  assert.deepStrictEqual(bul(h, 0), { kaynak: 0, hedef: 0, birlesti: false });
  assert.deepStrictEqual(bul(h, 1), { kaynak: 1, hedef: 1, birlesti: true });
  assert.deepStrictEqual(bul(h, 2), { kaynak: 2, hedef: 1, birlesti: true });
});
test("A A A: ilk çift birleşir, üçüncü taş yanına gelir ve birleşmez", () => {
  const t = [[1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const h = M.kaydir(t, "sol").hareketler;
  assert.deepStrictEqual(bul(h, 2), { kaynak: 2, hedef: 1, birlesti: false });
});
test("sağa birleşme: iki taş da 3'e gider", () => {
  const t = [[0, 0, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const h = M.kaydir(t, "sag").hareketler;
  assert.deepStrictEqual(h.map((x) => x.hedef), [3, 3]);
});
test("dört yön: tek taş (indeks 5) duvara gider", () => {
  const t = M.bosTahta();
  t[1][1] = 3;
  const hedef = (yon) => M.kaydir(t, yon).hareketler[0].hedef;
  assert.strictEqual(hedef("sol"), 4);
  assert.strictEqual(hedef("sag"), 7);
  assert.strictEqual(hedef("yukari"), 1);
  assert.strictEqual(hedef("asagi"), 13);
});
test("her taş için tam bir kayıt var", () => {
  const t = [[1, 0, 2, 2], [0, 3, 0, 0], [4, 4, 0, 1], [0, 0, 0, 5]];
  const taslar = t.flat().filter((x) => x !== 0).length;
  for (const yon of ["sol", "sag", "yukari", "asagi"]) {
    const h = M.kaydir(t, yon).hareketler;
    assert.strictEqual(h.length, taslar);
    assert.strictEqual(new Set(h.map((x) => x.kaynak)).size, taslar);
  }
});
test("hareketsiz hamle: kaynak = hedef, birlesti=false", () => {
  const t = [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const s = M.kaydir(t, "sol");
  assert.strictEqual(s.hareket, false);
  assert.ok(s.hareketler.every((h) => h.kaynak === h.hedef && !h.birlesti));
});
test("hareketsiz hamlede hamleYap boş liste ve yeniTas=null döner", () => {
  const durum = { tahta: [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazandi: false, bitti: false };
  const s = M.hamleYap(durum, "sol", sabit(0));
  assert.deepStrictEqual(s.hareketler, []);
  assert.strictEqual(s.yeniTas, null);
});
test("H ile H: yerinde kalır, birleşmez", () => {
  const t = [[H, H, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const h = M.kaydir(t, "sol").hareketler;
  assert.ok(h.every((x) => x.kaynak === x.hedef && !x.birlesti));
});
test("yeni taşın hücre indeksi sonuçta var ve tahtada o hücre dolu", () => {
  const durum = { tahta: [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazandi: false, bitti: false };
  const s = M.hamleYap(durum, "sol", sabit(0, 0)); // ilk boş hücre: indeks 1
  assert.strictEqual(s.yeniTas, 1);
  assert.strictEqual(durum.tahta[0][1], 1);
});
test("yeni taş, kaydırma sonrası boş olan bir hücreye düşer", () => {
  const durum = { tahta: [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazandi: false, bitti: false };
  const s = M.hamleYap(durum, "sol", sabit(0.99, 0));
  assert.strictEqual(s.yeniTas, 15);
  assert.strictEqual(durum.tahta[3][3], 1);
});
test("hareketler kaydır'ın girdisini değiştirmez", () => {
  const t = [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const once = JSON.stringify(t);
  M.kaydir(t, "sol");
  assert.strictEqual(JSON.stringify(t), once);
});

console.log("Kayıttan oyun kurma");
test("kayıttan durum kurulur: tahta, puan, kazandi", () => {
  const kayit = { surum: 1, tahta: [[1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 3]], puan: 44, kazanmaBildirildi: true };
  const d = M.durumdanOyunKur(kayit);
  assert.deepStrictEqual(d.tahta, kayit.tahta);
  assert.strictEqual(d.puan, 44);
  assert.strictEqual(d.kazandi, true);
  assert.strictEqual(d.bitti, false);
});
test("kayıttan kurulan tahta kopyadır", () => {
  const kayit = { surum: 1, tahta: [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 0, kazanmaBildirildi: false };
  const d = M.durumdanOyunKur(kayit);
  d.tahta[0][0] = 5;
  assert.strictEqual(kayit.tahta[0][0], 1);
});
test("kilitli tahta kaydı bitti=true çıkar", () => {
  const kayit = { surum: 1, tahta: kilitli.map((s) => s.slice()), puan: 10, kazanmaBildirildi: false };
  assert.strictEqual(M.durumdanOyunKur(kayit).bitti, true);
});
test("kayıttan kurulan oyunda hamle çalışır", () => {
  const kayit = { surum: 1, tahta: [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], puan: 5, kazanmaBildirildi: false };
  const d = M.durumdanOyunKur(kayit);
  M.hamleYap(d, "sol", sabit(0, 0));
  assert.strictEqual(d.tahta[0][0], 2);
  assert.strictEqual(d.puan, 9);
});

console.log("\n" + gecen + " geçti, " + kalan + " kaldı");
process.exit(kalan ? 1 : 0);
