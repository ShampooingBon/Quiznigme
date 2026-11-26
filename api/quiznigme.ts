import { getLevels } from '../src/engine';
import type { Category, Difficulty } from '../src/data/types';

const categories: Category[] = ['maths', 'francais', 'enigmes', 'mix'];
const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile'];

export default function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined> },
  res: {
    setHeader(name: string, value: string): void;
    status(code: number): { json(body: unknown): void };
    json(body: unknown): void;
  }
) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Méthode non autorisée. Utilise GET.' });
  }

  const category = req.query?.category;
  const difficulty = req.query?.difficulty;

  if (category === undefined && difficulty === undefined) {
    return res.status(200).json({
      name: 'Quiznigme',
      version: '0.1.0',
      description: 'API publique en lecture seule pour consulter les questions de Quiznigme.',
      categories,
      difficulties,
      levelsPerGame: 25,
      endpoints: {
        questions: '/api/quiznigme?category=maths&difficulty=facile',
      },
    });
  }

  if (
    typeof category !== 'string' ||
    !categories.includes(category as Category) ||
    typeof difficulty !== 'string' ||
    !difficulties.includes(difficulty as Difficulty)
  ) {
    return res.status(400).json({
      error: 'Paramètres invalides.',
      usage: '/api/quiznigme?category=maths&difficulty=facile',
      categories,
      difficulties,
    });
  }

  const selectedCategory = category as Category;
  const selectedDifficulty = difficulty as Difficulty;
  const questions = getLevels(selectedCategory, selectedDifficulty);

  return res.status(200).json({
    category: selectedCategory,
    difficulty: selectedDifficulty,
    count: questions.length,
    questions: questions.map((question, index) => ({
      level: index + 1,
      question: question.q,
      choices: question.choices,
      correctChoiceIndex: question.a,
      correctAnswer: question.choices[question.a],
    })),
  });
}
