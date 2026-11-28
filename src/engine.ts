import { Category, Difficulty, Question, levelCount } from './data/types';
import { francais } from './data/francais';
import { francaisPlus } from './data/francais-plus';
import { enigmes } from './data/enigmes';
import { enigmesPlus } from './data/enigmes-plus';
import type { Row } from './data/francais';

/** Générateur pseudo-aléatoire déterministe : un niveau donne toujours la même question. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const shuffle = <T,>(a: T[], r: () => number) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const fromRows = (rows: Row[]): Question[] => rows.map(r => {
  const choices = shuffle([r[1], r[2], r[3]], rng(hash(r[0])));
  return { q: r[0], choices, a: choices.indexOf(r[1]) };
});

// ---------- Mathématiques : générées par niveau (difficulté croissante) ----------
const ri = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1));

/** Niveaux 26 à 50 des maths (j = 0 à 24). */
function extra(d: Difficulty, j: number, r: () => number): [string, number] {
  if (d === 'facile') {
    if (j < 6) { const a = ri(r, 10, 30), b = ri(r, 5, 25); return [`${a} + ${b} = ?`, a + b]; }
    if (j < 12) { const a = ri(r, 20, 50), b = ri(r, 5, 19); return [`${a} − ${b} = ?`, a - b]; }
    if (j < 18) { const a = ri(r, 2, 10), b = ri(r, 2, 10); return [`${a} × ${b} = ?`, a * b]; }
    if (j < 22) { const b = ri(r, 2, 5), c = ri(r, 2, 10); return [`${b * c} ÷ ${b} = ?`, c]; }
    const n = ri(r, 6, 30); return [`Quel est le double de ${n} ?`, 2 * n];
  }
  if (d === 'moyen') {
    if (j < 6) { const a = ri(r, 100, 500), b = ri(r, 50, 300); return [`${a} + ${b} = ?`, a + b]; }
    if (j < 12) { const a = ri(r, 200, 900), b = ri(r, 50, 199); return [`${a} − ${b} = ?`, a - b]; }
    if (j < 18) { const a = ri(r, 11, 19), b = ri(r, 3, 9); return [`${a} × ${b} = ?`, a * b]; }
    if (j < 22) { const b = ri(r, 6, 12), c = ri(r, 6, 15); return [`${b * c} ÷ ${b} = ?`, c]; }
    const L = ri(r, 4, 15), l = ri(r, 2, L - 1);
    return [`Quelle est l'aire d'un rectangle de ${L} cm sur ${l} cm ? (en cm²)`, L * l];
  }
  if (j < 6) { const a = ri(r, 3, 12), b = ri(r, 3, 12), c = ri(r, 3, 12), e = ri(r, 3, 12); return [`${a} × ${b} + ${c} × ${e} = ?`, a * b + c * e]; }
  if (j < 12) { const x = ri(r, 5, 20), a = ri(r, 2, 9), b = ri(r, 1, 10); return [`Si ${a}x − ${b} = ${a * x - b}, que vaut x ?`, x]; }
  if (j < 17) { const p = [5, 10, 15, 30, 75][j % 5], n = ri(r, 2, 20) * 20; return [`Combien font ${p} % de ${n} ?`, (n * p) / 100]; }
  if (j < 21) { const a = ri(r, 3, 9); return [`Combien font ${a}³ ?`, a ** 3]; }
  if (j < 24) { const L = ri(r, 5, 30), l = ri(r, 2, L - 1); return [`Quel est le périmètre d'un rectangle de ${L} cm sur ${l} cm ? (en cm)`, 2 * (L + l)]; }
  const m = ri(r, 5, 40), k = ri(r, 1, m - 1);
  return [`Quelle est la moyenne de ${m - k}, ${m} et ${m + k} ?`, m];
}

/** Niveaux 51 à 75 des maths (j = 0 à 24). */
function extra2(d: Difficulty, j: number, r: () => number): [string, number] {
  if (d === 'facile') {
    if (j < 5) { const a = ri(r, 1, 20), b = ri(r, 1, 20), c = ri(r, 1, 20); return [`${a} + ${b} + ${c} = ?`, a + b + c]; }
    if (j < 10) { const a = ri(r, 10, 40), b = ri(r, 5, 30); return [`Léo a ${a} billes et en gagne ${b}. Combien en a-t-il maintenant ?`, a + b]; }
    if (j < 15) { const a = ri(r, 20, 60), b = ri(r, 5, a - 5); return [`Il y a ${a} bonbons. On en mange ${b}. Combien en reste-t-il ?`, a - b]; }
    if (j < 20) { const n = ri(r, 2, 6), k = ri(r, 2, 10); return [`Il y a ${n} sachets de ${k} bonbons. Combien de bonbons en tout ?`, n * k]; }
    if (j < 23) { const b = ri(r, 2, 5), c = ri(r, 2, 10); return [`${b * c} bonbons sont partagés entre ${b} enfants. Combien chacun en reçoit-il ?`, c]; }
    const s = ri(r, 1, 20), st = ri(r, 2, 9);
    return [`Quel nombre continue la suite : ${s}, ${s + st}, ${s + 2 * st}, ${s + 3 * st}, ?`, s + 4 * st];
  }
  if (d === 'moyen') {
    if (j < 5) { const a = ri(r, 3, 9), b = ri(r, 3, 9), c = ri(r, 1, 30); return [`${a} × ${b} + ${c} = ?`, a * b + c]; }
    if (j < 10) { const n = ri(r, 4, 30); return [`Quel est le tiers de ${3 * n} ?`, n]; }
    if (j < 15) { const n = ri(r, 3, 9), p = ri(r, 2, 9); return [`Léa achète ${n} cahiers à ${p} € pièce. Combien paie-t-elle ? (en €)`, n * p]; }
    if (j < 19) { const h = ri(r, 1, 3), m = 5 * ri(r, 1, 11); return [`Un film dure ${h} h ${m} min. Combien cela fait-il de minutes ?`, 60 * h + m]; }
    if (j < 23) { const c = ri(r, 3, 25); return [`Quel est le périmètre d'un triangle équilatéral de côté ${c} cm ? (en cm)`, 3 * c]; }
    const a = ri(r, 12, 30), b = ri(r, 3, 6); return [`Combien font ${a} × ${b} ?`, a * b];
  }
  if (j < 5) { const a = ri(r, 3, 15), b = ri(r, 3, 15), c = ri(r, 2, 9); return [`(${a} + ${b}) × ${c} = ?`, (a + b) * c]; }
  if (j < 10) { const a = ri(r, 2, 9), k = ri(r, 2, 15), b = ri(r, 1, 20); return [`Si x ÷ ${a} + ${b} = ${k + b}, que vaut x ?`, a * k]; }
  if (j < 15) { const p = ri(r, 2, 20) * 20, rd = [10, 25, 50, 20][j % 4]; return [`Un article à ${p} € est vendu avec ${rd} % de réduction. Quel est le prix final ? (en €)`, (p * (100 - rd)) / 100]; }
  if (j < 19) { const a = ri(r, 3, 12), b = ri(r, 3, 12); return [`Combien font ${a}² + ${b}² ?`, a * a + b * b]; }
  if (j < 22) { const n = ri(r, 6, 25); return [`Quelle est la racine carrée de ${n * n} ?`, n]; }
  if (j < 24) { const m = ri(r, 10, 50), k = ri(r, 1, 9), l = ri(r, 1, 9); return [`Quelle est la moyenne de ${m - k}, ${m + k}, ${m - l} et ${m + l} ?`, m]; }
  const v = 10 * ri(r, 4, 12), t = ri(r, 2, 6);
  return [`Une voiture roule à ${v} km/h pendant ${t} h. Quelle distance parcourt-elle ? (en km)`, v * t];
}

function mathsLevel(d: Difficulty, i: number, salt = 0): Question {
  const r = rng(hash(d) + i * 977 + salt * 7919); let q = ''; let ans = 0;
  if (i >= 50) [q, ans] = extra2(d, i - 50, r);
  else if (i >= 25) [q, ans] = extra(d, i - 25, r);
  else if (d === 'facile') {
    const m = 5 + i;
    if (i < 8) { const a = ri(r, 1, m), b = ri(r, 1, m); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (i < 14) { const a = ri(r, 5, m + 5), b = ri(r, 1, a - 1); q = `${a} − ${b} = ?`; ans = a - b; }
    else if (i < 19) { const a = [2, 3, 4, 5, 10][i % 5], b = ri(r, 1, 10); q = `${a} × ${b} = ?`; ans = a * b; }
    else if (i < 23) { const a = ri(r, 2, 20), b = ri(r, 2, 20); q = `${a} + ? = ${a + b}`; ans = b; }
    else { const h = ri(r, 3, 25); q = `Quelle est la moitié de ${2 * h} ?`; ans = h; }
  } else if (d === 'moyen') {
    if (i < 6) { const a = ri(r, 20, 90), b = ri(r, 15, 80); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (i < 12) { const a = ri(r, 60, 200), b = ri(r, 15, 59); q = `${a} − ${b} = ?`; ans = a - b; }
    else if (i < 18) { const a = ri(r, 6, 9), b = ri(r, 6, 12); q = `${a} × ${b} = ?`; ans = a * b; }
    else if (i < 22) { const b = ri(r, 3, 9), c = ri(r, 4, 12); q = `${b * c} ÷ ${b} = ?`; ans = c; }
    else { const c = ri(r, 4, 30); q = `Quel est le périmètre d'un carré de côté ${c} cm ? (en cm)`; ans = 4 * c; }
  } else {
    if (i < 6) { const a = ri(r, 6, 15), b = ri(r, 6, 15), c = ri(r, 5, 40); q = `${a} × ${b} − ${c} = ?`; ans = a * b - c; }
    else if (i < 12) { const x = ri(r, 2, 15), a = ri(r, 2, 9), b = ri(r, 1, 30); q = `Si ${a}x + ${b} = ${a * x + b}, que vaut x ?`; ans = x; }
    else if (i < 17) { const p = [10, 25, 50, 20][i % 4], n = ri(r, 2, 20) * 20; q = `Combien font ${p} % de ${n} ?`; ans = (n * p) / 100; }
    else if (i < 21) { const a = ri(r, 6, 20); q = `Combien font ${a}² ?`; ans = a * a; }
    else if (i < 24) { const n = ri(r, 2, 12) * 4; q = `Combien font les 3/4 de ${n} ?`; ans = (n * 3) / 4; }
    else { const a = ri(r, 8, 15), b = ri(r, 2, 7); q = `Combien font ${a}² − ${b}² ?`; ans = a * a - b * b; }
  }
  const set = new Set([ans]); const cand = [1, -1, 2, -2, 10, -10, 3, 5, -5];
  for (const c of shuffle(cand, r)) { if (set.size >= 3) break; if (ans + c >= 0) set.add(ans + c); }
  const choices = shuffle([...set].map(String), r);
  return { q, choices, a: choices.indexOf(String(ans)) };
}

/** « 1 + 2 » et « 2 + 1 » (ou « 3 × 4 » et « 4 × 3 ») donnent la même clé. */
const canon = (q: string) => q.replace(/^(\d+) ([+×]) (\d+) = \?$/, (_, a, o, b) => {
  const [m, n] = [+a, +b].sort((u, v) => u - v); return `${m} ${o} ${n}`;
});
/** Niveaux de maths d'une difficulté, sans doublon ni question équivalente. */
function mathsList(d: Difficulty): Question[] {
  const seen = new Set<string>();
  return Array.from({ length: levelCount('maths') }, (_, i) => {
    let q = mathsLevel(d, i, 0);
    for (let s = 1; s < 80 && seen.has(canon(q.q)); s++) q = mathsLevel(d, i, s);
    seen.add(canon(q.q)); return q;
  });
}

const cache = new Map<string, Question[]>();
function base(cat: Exclude<Category, 'mix'>, d: Difficulty): Question[] {
  const k = cat + d; if (cache.has(k)) return cache.get(k)!;
  const l = cat === 'maths' ? mathsList(d)
    : fromRows(cat === 'francais' ? [...francais[d], ...francaisPlus[d]] : [...enigmes[d], ...enigmesPlus[d]]);
  cache.set(k, l); return l;
}
/** Niveaux d'un jeu. « mix » alterne maths → français → énigmes. */
export function getLevels(cat: Category, d: Difficulty): Question[] {
  const n = levelCount(cat);
  if (cat !== 'mix') return base(cat, d).slice(0, n);
  const order = ['maths', 'francais', 'enigmes'] as const;
  return Array.from({ length: n }, (_, i) => base(order[i % 3], d)[i]);
}

// ---------- Progression (localStorage) : clés inchangées, rien n'est réinitialisé ----------
export interface Progress { unlocked: number; stars: number[]; }
const key = (c: Category, d: Difficulty) => `quiznigme:v2:${c}:${d}`;
export function getProgress(c: Category, d: Difficulty): Progress {
  let p: Progress;
  try { p = JSON.parse(localStorage.getItem(key(c, d)) ?? '') as Progress; } catch { p = { unlocked: 1, stars: [] }; }
  p.stars = Array.isArray(p.stars) ? p.stars : [];
  let last = -1; p.stars.forEach((s, i) => { if (s > 0) last = i; });
  // Débloque le niveau suivant le dernier réussi (ex. ceux qui avaient fini le 50 voient le 51).
  p.unlocked = Math.min(Math.max(p.unlocked || 1, last + 2), levelCount(c));
  return p;
}
export function saveResult(c: Category, d: Difficulty, level: number, stars: number) {
  const p = getProgress(c, d);
  p.stars[level] = Math.max(p.stars[level] ?? 0, stars);
  p.unlocked = Math.max(p.unlocked, Math.min(level + 2, levelCount(c)));
  try { localStorage.setItem(key(c, d), JSON.stringify(p)); } catch { /* ignoré */ }
}
