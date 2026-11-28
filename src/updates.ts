export interface Update { name: string; date: string; say: string; image: string; }

export const FALLBACK: Update = {
  name: 'Nouvelle mise à jour',
  date: '2026-11-28',
  say: 'Nouvelle mise à jour ! Fait le 28 novembre.',
  image: 'updates/images/maj-2026-11-28.png',
};

export const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export async function loadUpdate(): Promise<Update> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}updates/latest.json`, { cache: 'no-store' });
    if (r.ok) return (await r.json()) as Update;
  } catch { /* version intégrée */ }
  return FALLBACK;
}

