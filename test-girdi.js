// yonBul testleri. Çalıştır: node test-girdi.js
const assert = require("assert");
const { yonBul } = require("./js/girdi.js");

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
const ESIK = 30;

console.log("Dört yön");
test("sola", () => assert.strictEqual(yonBul(-80, 0, ESIK), "sol"));
test("sağa", () => assert.strictEqual(yonBul(80, 0, ESIK), "sag"));
test("yukarı (dy negatif)", () => assert.strictEqual(yonBul(0, -80, ESIK), "yukari"));
test("aşağı (dy pozitif)", () => assert.strictEqual(yonBul(0, 80, ESIK), "asagi"));

console.log("Eşik");
test("eşik altı null", () => assert.strictEqual(yonBul(20, -10, ESIK), null));
test("hiç hareket yok null", () => assert.strictEqual(yonBul(0, 0, ESIK), null));
test("tam eşikte yön verir", () => assert.strictEqual(yonBul(30, 0, ESIK), "sag"));
test("eşiğin hemen altı null", () => assert.strictEqual(yonBul(29, 29, ESIK), null));

console.log("Eğik hareket");
test("yatay baskın: (-60, 40) sol", () => assert.strictEqual(yonBul(-60, 40, ESIK), "sol"));
test("dikey baskın: (40, -60) yukarı", () => assert.strictEqual(yonBul(40, -60, ESIK), "yukari"));
test("dikey baskın: (-10, 90) aşağı", () => assert.strictEqual(yonBul(-10, 90, ESIK), "asagi"));
test("tam çapraz eşitlikte yatay", () => assert.strictEqual(yonBul(50, 50, ESIK), "sag"));
test("tek eksen eşik üstündeyse yeter (45, 5)", () => assert.strictEqual(yonBul(45, 5, ESIK), "sag"));

console.log("\n" + gecen + " geçti, " + kalan + " kaldı");
process.exit(kalan ? 1 : 0);
