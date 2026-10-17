// Kaydırma hareketinden yön bulur. Saf fonksiyon: DOM'a dokunmaz.
// dx, dy: parmağın yatay/dikey yer değiştirmesi (piksel). esik: en az mesafe.
function yonBul(dx, dy, esik) {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < esik) return null; // çok kısa, kaydırma sayılmaz
  if (ax >= ay) return dx < 0 ? "sol" : "sag"; // baskın eksen yatay (eşitlikte yatay)
  return dy < 0 ? "yukari" : "asagi"; // ekranda y aşağı doğru artar
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { yonBul };
}
