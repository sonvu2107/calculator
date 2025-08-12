const SCALE = 12;

export function roundFixed(x, digits = SCALE) {
  if (!isFinite(x)) return x;
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}

export function fmtDisplay(x) {
  if (x === Infinity) return "∞";
  if (x === -Infinity) return "-∞";
  if (Number.isNaN(x)) return "Error";
  const s = Math.abs(x) >= 1e12 || (Math.abs(x) > 0 && Math.abs(x) < 1e-9)
    ? x.toExponential(8)
    : x.toFixed(12);
  return s.replace(/\.?0+($|e)/i, "$1");
}
