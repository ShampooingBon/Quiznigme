export type Category = 'maths' | 'francais' | 'enigmes' | 'mix';
export type Difficulty = 'facile' | 'moyen' | 'difficile';
export interface Question { q: string; choices: string[]; a: number; }
/** Nombre de niveaux par jeu (identique pour les 3 difficultés). */
export const LEVELS: Record<Category, number> = { maths: 75, francais: 75, enigmes: 100, mix: 75 };
export const levelCount = (c: Category) => LEVELS[c];
export const MAX_LEVELS = 100;
