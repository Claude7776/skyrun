# Documentation API

L'API REST est versionnée sous `/api/v1` et documentée via **Swagger/OpenAPI**,
généré automatiquement à partir des annotations JSDoc `@openapi` présentes dans
`backend/src/routes/**/*.js` (voir `backend/src/docs/swagger.js`).

**Interface interactive** : http://localhost:5000/api-docs

## Format de réponse

```json
// Succès
{ "success": true, "message": "Success", "data": { } }

// Erreur
{ "success": false, "message": "Description de l'erreur", "details": ["..."] }
```

## Authentification mobile — refresh token

Le client web (s'il existe un jour) reçoit le refresh token via un cookie
`httpOnly`. **Le client mobile n'a pas de jar de cookies persistant fiable** :
`register`, `login` et `refresh` renvoient donc aussi `refreshToken` dans le
corps JSON, à stocker côté client (l'app mobile utilise `expo-secure-store`).
`POST /auth/refresh` et `POST /auth/logout` acceptent ce token soit via le
cookie, soit via `{ "refreshToken": "..." }` dans le body.

## Endpoints disponibles

| Méthode | Route                    | Description                                  | Auth requise | Statut     |
| ------- | ------------------------- | ----------------------------------------------- | ------------- | ----------- |
| GET     | `/api/v1/health`            | Liveness/readiness probe                          | Non            | ✅ Phase 0   |
| POST    | `/api/v1/auth/register`       | Créer un compte                                      | Non            | ✅ Phase 1   |
| POST    | `/api/v1/auth/login`            | Se connecter                                            | Non            | ✅ Phase 1   |
| POST    | `/api/v1/auth/refresh`            | Rafraîchir l'access token (rotation)                       | Non (refresh token) | ✅ Phase 1 |
| POST    | `/api/v1/auth/logout`               | Déconnexion, révoque la session                               | Non (refresh token) | ✅ Phase 1 |
| GET     | `/api/v1/auth/me`                     | Utilisateur courant                                              | Oui            | ✅ Phase 1   |
| PATCH   | `/api/v1/users/me`                      | Modifier profil (nom, email, mot de passe)                          | Oui            | ✅ Phase 1   |
| POST    | `/api/v1/users/me/avatar`                 | Upload de l'avatar                                                      | Oui            | ✅ Phase 1   |
| POST    | `/api/v1/runs`                              | Enregistre un footing (distance/allure/calories calculées serveur)         | Oui            | ✅ Phase 2   |
| GET     | `/api/v1/runs`                                | Liste paginée des footings de l'utilisateur                                  | Oui            | ✅ Phase 2   |
| GET     | `/api/v1/runs/:id`                              | Détail d'un footing (stats + trajet GPS)                                       | Oui            | ✅ Phase 2   |
| PATCH   | `/api/v1/runs/:id`                                | Renomme un footing (seul le titre est modifiable)                                | Oui            | ✅ Phase 2   |
| DELETE  | `/api/v1/runs/:id`                                  | Supprime un footing                                                                | Oui            | ✅ Phase 2   |
| POST    | `/api/v1/courses`                                     | Crée un parcours                                                                     | Oui            | ✅ Phase 3   |
| GET     | `/api/v1/courses`                                       | Liste paginée des parcours de l'utilisateur                                            | Oui            | ✅ Phase 3   |
| GET     | `/api/v1/courses/:id`                                     | Détail d'un parcours                                                                      | Oui            | ✅ Phase 3   |
| PATCH   | `/api/v1/courses/:id`                                       | Modifie un parcours (nom, description, difficulté, distance, temps, visibilité)              | Oui            | ✅ Phase 3   |
| DELETE  | `/api/v1/courses/:id`                                         | Supprime un parcours                                                                            | Oui            | ✅ Phase 3   |
| POST    | `/api/v1/courses/:id/share`                                     | Marque le parcours comme public                                                                  | Oui            | ✅ Phase 3   |
| GET     | `/api/v1/runs/stats/summary`                                      | Totaux tableau de bord (distance, temps, footings, calories, allure/temps moyens)                  | Oui            | ✅ Phase 4   |
| GET     | `/api/v1/runs/stats/weekly`                                         | Distance par semaine, 8 dernières semaines (zero-filled)                                             | Oui            | ✅ Phase 4   |
| GET     | `/api/v1/runs/stats/monthly`                                          | Distance par mois, 6 derniers mois (zero-filled)                                                       | Oui            | ✅ Phase 4   |
| GET     | `/api/v1/runs/stats/records`                                            | Records personnels (distance, durée, allure)                                                             | Oui            | ✅ Phase 4   |
| POST    | `/api/v1/goals`                                                           | Crée un objectif (5k/10k/semi/marathon/personnalisé)                                                        | Oui            | ✅ Phase 5   |
| GET     | `/api/v1/goals`                                                             | Liste les objectifs avec progression calculée en direct                                                       | Oui            | ✅ Phase 5   |
| GET     | `/api/v1/goals/:id`                                                           | Détail d'un objectif                                                                                             | Oui            | ✅ Phase 5   |
| DELETE  | `/api/v1/goals/:id`                                                             | Supprime un objectif                                                                                               | Oui            | ✅ Phase 5   |
| GET     | `/api/v1/social/feed`                                                             | Fil des parcours publics (tous utilisateurs), paginé                                                                 | Oui            | ✅ Phase 6   |
| POST    | `/api/v1/courses/:id/like`                                                          | Aime un parcours visible (propriétaire ou public)                                                                      | Oui            | ✅ Phase 6   |
| DELETE  | `/api/v1/courses/:id/like`                                                            | Retire son like                                                                                                          | Oui            | ✅ Phase 6   |
| GET     | `/api/v1/courses/:id/comments`                                                          | Liste les commentaires d'un parcours                                                                                       | Oui            | ✅ Phase 6   |
| POST    | `/api/v1/courses/:id/comments`                                                            | Ajoute un commentaire                                                                                                        | Oui            | ✅ Phase 6   |
| DELETE  | `/api/v1/comments/:commentId`                                                                | Supprime son propre commentaire                                                                                                | Oui            | ✅ Phase 6   |
| GET     | `/api/v1/notifications`                                                                        | Liste les notifications (50 dernières) + compteur non lu                                                                        | Oui            | ✅ Phase 6   |
| PATCH   | `/api/v1/notifications/:id/read`                                                                  | Marque une notification comme lue                                                                                                 | Oui            | ✅ Phase 6   |
| PATCH   | `/api/v1/notifications/read-all`                                                                     | Marque toutes les notifications comme lues                                                                                          | Oui            | ✅ Phase 6   |

Toutes les phases prévues sont désormais couvertes (voir la racine
`README.md#roadmap`). Pour le détail exhaustif des schémas de requête/réponse
à jour, se référer à `/api-docs`, qui reste la source de vérité (générée
depuis le code).

## Calcul des métriques d'un footing

`avgSpeedKmh`, `avgPaceMinPerKm` et `calories` ne sont **jamais acceptés depuis
le client** : ils sont recalculés côté serveur (`services/run.service.js`,
`services/calorie.service.js`) à partir de `distanceKm`/`durationSec` envoyés.
`calories` utilise une estimation simple (`distanceKm × 62 kcal`) faute de
poids utilisateur collecté — documenté comme approximation, pas un calcul MET
précis.

## Sémantique d'un objectif (Goal)

Un objectif est atteint dès qu'un **seul footing** couvre au moins
`targetDistanceKm` (pas une somme cumulée sur plusieurs footings) — cohérent
avec les presets qui sont des distances de course (5 km, 10 km, semi,
marathon). Seuls les footings enregistrés **après la création de l'objectif**
comptent pour la progression (`bestDistanceKm`/`progressPercent`, recalculés à
la volée à chaque lecture) ; un footing plus ancien qui dépasserait déjà la
cible n'y contribue pas rétroactivement. Dès qu'un nouveau footing (`POST
/runs`) satisfait un objectif actif, celui-ci passe à `achieved: true` et une
`Notification` (`type: "goal_achieved"`) est créée — voir
`services/goal.service.js#evaluateGoalsForRun`.

## Visibilité d'un parcours (Course)

`GET /courses` (liste) ne renvoie que les parcours de l'utilisateur courant.
`GET /courses/:id` (détail) est en revanche accessible si le parcours
appartient à l'utilisateur **ou** s'il est public (`isPublic: true`) — c'est
ce qui permet de consulter, aimer et commenter le parcours d'un autre
utilisateur découvert via `/social/feed`. Modifier, partager et supprimer
restent strictement réservés au propriétaire, quelle que soit la visibilité.
La réponse de `GET /courses/:id` inclut `likesCount`/`likedByMe` (calculés à
la volée), contrairement à `GET /courses` qui ne les fournit pas.

## Déclencheurs de notifications

| Type                 | Déclenché par                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `goal_achieved`          | `POST /runs` — un footing satisfait un objectif actif (voir ci-dessus).                    |
| `new_record`               | `POST /runs` — le footing bat un record personnel existant (distance, durée ou allure). Ignoré pour le tout premier footing d'un utilisateur (rien à battre). |
| `training_reminder`          | Évalué **paresseusement** à la lecture de `GET /notifications` : aucun footing depuis 3 jours et pas déjà de rappel récent → un rappel est créé à ce moment-là. Pas de scheduler/cron dans ce backend. |
