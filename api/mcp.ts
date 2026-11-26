import { getLevels } from '../src/engine';
import type { Category, Difficulty } from '../src/data/types';

const categories: Category[] = ['maths', 'francais', 'enigmes', 'mix'];
const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile'];
const protocolVersion = '2025-03-26';

type RpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function json(res: any, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.json(body);
}

function rpcError(id: RpcRequest['id'], code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return json(res, 405, { error: 'Utilise POST pour communiquer avec le serveur MCP Quiznigme.' });
  }

  const body = req.body as RpcRequest;
  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return json(res, 400, rpcError(body?.id, -32600, 'Requête JSON-RPC invalide.'));
  }

  // Les notifications ne reçoivent pas de réponse JSON-RPC.
  if (body.id === undefined && body.method.startsWith('notifications/')) {
    return res.status(202).end();
  }

  if (body.method === 'initialize') {
    return json(res, 200, {
      jsonrpc: '2.0',
      id: body.id ?? null,
      result: {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: 'quiznigme', version: '0.1.0' },
        instructions: 'Serveur Quiznigme en lecture seule : consulte les catégories, difficultés et questions du jeu.',
      },
    });
  }

  if (body.method === 'ping') {
    return json(res, 200, { jsonrpc: '2.0', id: body.id ?? null, result: {} });
  }

  if (body.method === 'tools/list') {
    return json(res, 200, {
      jsonrpc: '2.0',
      id: body.id ?? null,
      result: {
        tools: [
          {
            name: 'quiznigme_get_info',
            description: 'Affiche les catégories, difficultés et informations générales de Quiznigme.',
            inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          },
          {
            name: 'quiznigme_get_questions',
            description: 'Récupère les questions d’une catégorie et d’une difficulté, avec les choix et la bonne réponse.',
            inputSchema: {
              type: 'object',
              properties: {
                category: { type: 'string', enum: categories },
                difficulty: { type: 'string', enum: difficulties },
              },
              required: ['category', 'difficulty'],
              additionalProperties: false,
            },
          },
        ],
      },
    });
  }

  if (body.method === 'tools/call') {
    const params = body.params ?? {};
    const name = params.name;
    const args = (params.arguments ?? {}) as Record<string, unknown>;

    if (name === 'quiznigme_get_info') {
      return json(res, 200, {
        jsonrpc: '2.0',
        id: body.id ?? null,
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              name: 'Quiznigme',
              version: '0.1.0',
              categories,
              difficulties,
              levelsPerGame: 25,
              mode: 'read-only',
            }),
          }],
        },
      });
    }

    if (name === 'quiznigme_get_questions') {
      const category = args.category;
      const difficulty = args.difficulty;
      if (
        typeof category !== 'string' ||
        !categories.includes(category as Category) ||
        typeof difficulty !== 'string' ||
        !difficulties.includes(difficulty as Difficulty)
      ) {
        return json(res, 200, {
          jsonrpc: '2.0',
          id: body.id ?? null,
          result: {
            isError: true,
            content: [{ type: 'text', text: 'Paramètres invalides. Choisis une catégorie et une difficulté proposées.' }],
          },
        });
      }

      const questions = getLevels(category as Category, difficulty as Difficulty);
      return json(res, 200, {
        jsonrpc: '2.0',
        id: body.id ?? null,
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              category,
              difficulty,
              count: questions.length,
              questions: questions.map((question, index) => ({
                level: index + 1,
                question: question.q,
                choices: question.choices,
                correctChoiceIndex: question.a,
                correctAnswer: question.choices[question.a],
              })),
            }),
          }],
        },
      });
    }

    return json(res, 200, rpcError(body.id, -32602, 'Outil inconnu.'));
  }

  return json(res, 200, rpcError(body.id, -32601, 'Méthode inconnue.'));
}
