/** Aturan gerbang mutu (PRD F3). */

export function needed(raters: number, thresholdPct: number) {
  return Math.ceil((raters * thresholdPct) / 100 - 1e-9)
}

function choose(n: number, k: number) {
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

/** Peluang video lolos bila keterpahaman sebenarnya = p (binomial, P[X >= k]). */
export function passProbability(raters: number, thresholdPct: number, p: number) {
  const k = needed(raters, thresholdPct)
  let s = 0
  for (let x = k; x <= raters; x++) s += choose(raters, x) * p ** x * (1 - p) ** (raters - x)
  return s
}

export function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}
