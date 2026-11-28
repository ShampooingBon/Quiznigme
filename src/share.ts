import { Category, Difficulty, levelCount } from './data/types';
import { getProgress } from './engine';
import { sfx } from './audio';

const CATS: [Category, string][] = [['maths', 'Mathématiques'], ['francais', 'Français'], ['enigmes', 'Énigmes'], ['mix', 'Tout mélangé']];
const DIFFS: [Difficulty, string, string][] = [['facile', 'Facile', '#2e9e5b'], ['moyen', 'Moyen', '#f08a1c'], ['difficile', 'Difficile', '#d93a3a']];

export interface Stat { cat: Category; diff: Difficulty; done: number; total: number; stars: number; }

export function collectStats(): Stat[] {
  const out: Stat[] = [];
  for (const [cat] of CATS) for (const [diff] of DIFFS) {
    const p = getProgress(cat, diff); let done = 0, stars = 0;
    const total = levelCount(cat);
    for (let i = 0; i < total; i++) { const s = p.stars?.[i] ?? 0; if (s > 0) { done++; stars += s; } }
    out.push({ cat, diff, done, total, stars });
  }
  return out;
}

async function render(stats: Stat[]): Promise<HTMLCanvasElement> {
  try { await document.fonts.load('600 40px Fredoka'); } catch { /* police système */ }
  const W = 1080, H = 1640, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  const F = (px: number) => `600 ${px}px Fredoka, system-ui, sans-serif`;
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4338ca'); g.addColorStop(1, '#2b2780');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,0.06)';
  x.beginPath(); x.arc(940, 120, 220, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(100, 1500, 260, 0, Math.PI * 2); x.fill();

  x.textAlign = 'center';
  x.fillStyle = '#fff'; x.font = F(92); x.fillText('Quiznigme', W / 2, 130);
  x.fillStyle = '#c7c9ff'; x.font = F(40); x.fillText('Mes scores', W / 2, 190);

  const cardW = 304, gap = 24, left = 60; let y = 240;
  for (const [cat, label] of CATS) {
    x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = F(44); x.fillText(label, left, y + 44);
    y += 66;
    DIFFS.forEach(([diff, dl, col], k) => {
      const s = stats.find(t => t.cat === cat && t.diff === diff)!, cx = left + k * (cardW + gap);
      x.fillStyle = 'rgba(255,255,255,0.14)'; x.beginPath(); x.roundRect(cx, y, cardW, 190, 24); x.fill();
      x.fillStyle = col; x.beginPath(); x.roundRect(cx, y, cardW, 46, [24, 24, 0, 0]); x.fill();
      x.textAlign = 'center'; x.fillStyle = '#fff'; x.font = F(28); x.fillText(dl, cx + cardW / 2, y + 33);
      x.font = F(52); x.fillText(`${s.done} / ${s.total}`, cx + cardW / 2, y + 108);
      x.fillStyle = '#c7c9ff'; x.font = F(22); x.fillText('niveaux terminés', cx + cardW / 2, y + 138);
      x.fillStyle = '#ffe27a'; x.font = F(34); x.fillText(`★ ${s.stars}`, cx + cardW / 2, y + 174);
    });
    y += 190 + 34;
  }

  const total = stats.reduce((n, s) => n + s.stars, 0), max = stats.reduce((n, s) => n + s.total * 3, 0);
  x.fillStyle = '#fff'; x.beginPath(); x.roundRect(left, y, W - 120, 190, 28); x.fill();
  x.textAlign = 'center';
  x.fillStyle = '#4338ca'; x.font = F(36); x.fillText('Total des étoiles', W / 2, y + 54);
  x.fillStyle = '#f0a500'; x.font = F(86); x.fillText(`★ ${total}`, W / 2, y + 140);
  x.fillStyle = '#6b69b0'; x.font = F(26); x.fillText(`sur ${max} possibles`, W / 2, y + 176);
  x.fillStyle = '#c7c9ff'; x.font = F(26); x.fillText(location.host, W / 2, H - 22);
  return c;
}

export async function openShare(): Promise<void> {
  const stats = collectStats(), total = stats.reduce((n, s) => n + s.stars, 0);
  const canvas = await render(stats);
  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);

  const ov = document.createElement('div'); ov.id = 'shareov';
  const box = document.createElement('div'); box.className = 'sharebox';
  const img = document.createElement('img'); img.src = url; img.alt = 'Récapitulatif de mes scores Quiznigme';
  const close = () => { URL.revokeObjectURL(url); ov.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  ov.onclick = e => { if (e.target === ov) close(); };

  const dl = document.createElement('a'); dl.className = 'btn indigo'; dl.href = url; dl.download = 'quiznigme-scores.png';
  dl.textContent = '⬇ Télécharger l’image'; dl.onclick = () => sfx.click();
  box.append(img, dl);

  if (typeof navigator.share === 'function') {
    const sh = document.createElement('button'); sh.className = 'btn green'; sh.textContent = '➜ Partager';
    sh.onclick = async () => {
      sfx.click();
      const file = new File([blob], 'quiznigme-scores.png', { type: 'image/png' });
      const data = { title: 'Mes scores Quiznigme', text: `J'ai ${total} ★ sur Quiznigme !` };
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] });
        else await navigator.share({ ...data, url: location.href });
      } catch { /* partage annulé */ }
    };
    box.append(sh);
  }
  const cl = document.createElement('button'); cl.className = 'btn ghost'; cl.textContent = 'Fermer';
  cl.onclick = () => { sfx.click(); close(); };
  box.append(cl); ov.append(box); document.body.append(ov);
}
