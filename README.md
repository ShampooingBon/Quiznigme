# Quiznigme
`npm install` puis `npm run dev` (test) ou `npm run build` (version à publier dans `dist/`).

- `public/cat.png` : mascotte (détourée de votre image) · `public/logo.jpg` : logo officiel
- `src/mascot.ts` : animation yeux/bouche · `src/engine.ts` : niveaux, maths générées, progression
- `src/data/francais.ts`, `src/data/enigmes.ts` : questions `[question, bonne réponse, faux 1, faux 2]`


## API Quiznigme (lecture seule)

Une première API publique est disponible avec Vercel Functions :

- `GET /api/quiznigme` : informations générales, catégories et difficultés.
- `GET /api/quiznigme?category=maths&difficulty=facile` : questions d'une catégorie et d'une difficulté, avec les réponses correctes.

Catégories : `maths`, `francais`, `enigmes`, `mix`.
Difficultés : `facile`, `moyen`, `difficile`.

Cette première version est volontairement en lecture seule. Les questions du jeu sont actuellement dans le code source et la progression est enregistrée dans le navigateur de chaque joueur. Pour modifier les questions ou gérer les progressions depuis ChatGPT, il faudra ensuite ajouter une base de données et une authentification sécurisée. Ne place aucun mot de passe ni clé secrète dans le code public.
