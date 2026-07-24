# Architecture

## Vue d'ensemble

```
Mobile app (React Native / Expo, Android & iOS)
      │  HTTPS (appels directs, pas de proxy same-origin — ce n'est pas un navigateur)
      ▼
 Express API (backend container)
   Routes → Middlewares (auth, validation, rate limit) → Controllers → Services → Models (Mongoose)
      │
      ▼
   MongoDB (conteneur mongo, volume persistant)
```

Contrairement à un client web, l'app mobile ne bénéficie pas d'un proxy
same-origin : elle appelle directement `EXPO_PUBLIC_API_BASE_URL` (ex:
`http://192.168.1.10:5000/api/v1` en dev, une URL HTTPS publique en
production). Le CORS ne s'applique pas à elle (c'est un mécanisme navigateur) ;
la variable `CORS_ORIGIN` du backend ne concerne qu'un éventuel futur client
web/admin.

Un reverse proxy Nginx optionnel (`docker/nginx/`) est fourni pour la
production (terminaison TLS devant l'API) mais n'est pas démarré par défaut —
voir les commentaires dans `docker/nginx/nginx.conf`.

## Backend — MVC + couche services

```
backend/src/
├── config/        # env, connexion DB, logger (Winston)
├── models/        # schémas Mongoose (User, RefreshToken, Run, Course, Comment, Goal, Notification)
├── validators/     # schémas Zod (validation des entrées par route)
├── middlewares/     # auth (JWT), validate, rateLimiter, error, notFound, upload (Multer)
├── routes/v1/       # définition des endpoints REST, montés sous /api/v1
├── controllers/      # reçoivent req/res, délèguent aux services, formatent la réponse
├── services/         # logique métier pure (indépendante d'Express) : auth, tokens, stats, calories...
├── utils/             # ApiError, ApiResponse, asyncHandler, cookies
└── docs/               # génération Swagger (swagger-jsdoc)
```

**Pourquoi une couche services séparée des controllers ?** Les controllers ne font que
traduire HTTP ↔ métier (parser la requête, appeler un service, renvoyer une
`ApiResponse`). Toute la logique (calcul d'allure, agrégations statistiques, règles
d'objectifs, rotation des tokens...) vit dans `services/`, ce qui la rend testable
indépendamment d'Express et réutilisable.

**Gestion des erreurs** : chaque route asynchrone est enveloppée par `asyncHandler`
pour transmettre les rejets de promesses au middleware d'erreur centralisé
(`error.middleware.js`), qui normalise les erreurs Mongoose/JWT/Multer/`ApiError` en
une réponse JSON cohérente (`{ success, message, details? }`) et masque les détails
internes en production.

Ce backend n'a **pas été réécrit** pour la bascule vers le mobile : seule
l'authentification a reçu une adaptation additive (voir plus bas).

## Application mobile — Expo Router (file-based)

```
mobile/
├── app/                    # Écrans, un fichier = une route (Expo Router)
│   ├── _layout.tsx           # Providers globaux (React Query, Gesture Handler, Safe Area) + bootstrap de session
│   ├── (auth)/                # Groupe non authentifié
│   │   ├── _layout.tsx          # Stack ; redirige vers "/" si déjà connecté
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/                    # Groupe authentifié
│   │   ├── _layout.tsx              # Tab navigator ; redirige vers /login si non connecté
│   │   ├── index.tsx                 # Tableau de bord (totaux + graphiques + records, cf. plus bas)
│   │   ├── map.tsx                    # Suivi GPS temps réel + enregistrement du footing
│   │   ├── courses/                    # Pile imbriquée dans l'onglet (liste → détail → édition)
│   │   │   ├── _layout.tsx               # Stack propre à ce groupe
│   │   │   ├── index.tsx                  # Liste : bascule "Mes parcours" / "Découvrir" (fil public)
│   │   │   ├── new.tsx                     # Création
│   │   │   └── [id]/index.tsx, [id]/edit.tsx  # Détail (like + commentaires, propres ou publics), édition
│   │   ├── history/                     # Pile imbriquée : historique des footings
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx                  # Liste des footings
│   │   │   └── [id].tsx                    # Détail : carte du trajet, stats, renommer, supprimer
│   │   ├── goals.tsx                    # Liste des objectifs + création inline (pas de pile imbriquée : pas d'écran de détail/édition séparé)
│   │   ├── notifications.tsx            # Liste des notifications ; atteint via la cloche du tableau de bord (pas un onglet)
│   │   └── profile.tsx                # Profil + avatar + déconnexion
│   └── +not-found.tsx
├── src/
│   ├── api/          # client Axios (intercepteurs auth) + modules par ressource
│   ├── components/
│   │   ├── ui/         # UI générique : Button, Input, GlassCard (BlurView), ScreenContainer, AuthScreen, ProgressBar
│   │   └── map/          # RunMap (MapLibre + tuiles OSM + tracé du trajet, live ou lecture seule)
│   ├── features/       # composants propres à un domaine métier (features/auth, features/tracking, features/courses, features/dashboard, features/stats, features/history, features/goals, features/social, features/notifications...)
│   ├── hooks/            # useLiveTracking (suivi GPS foreground)
│   ├── store/              # Zustand : session utilisateur
│   ├── styles/               # theme.ts (design tokens — équivalent RN de tokens.css)
│   ├── types/                  # types partagés, miroir des DTO backend
│   └── utils/                    # errors.ts, url.ts, geo.ts (haversine), format.ts
├── assets/
├── app.json                # config Expo (permissions, plugins, bundle IDs)
└── babel.config.js
```

Les groupes de routes `(auth)` et `(app)` n'ajoutent pas de segment à l'URL —
`(app)/index.tsx` correspond à `/`, `(auth)/login.tsx` à `/login`. Chaque
`_layout.tsx` de groupe fait office de garde d'authentification (`<Redirect />`
selon le statut du store), l'équivalent mobile des `ProtectedRoute`/
`PublicOnlyRoute` d'une SPA React.

**Design system** : le thème sombre + glassmorphism du web (`tokens.css`) est
reproduit en TypeScript (`src/styles/theme.ts`) — mêmes couleurs, mêmes
espacements. Le glassmorphism utilise un vrai flou natif (`expo-blur`
`BlurView`) plutôt qu'une approximation CSS `backdrop-filter`.

## Authentification mobile (JWT + refresh token)

- Mot de passe hashé (bcrypt) — inchangé côté backend.
- **Access token** JWT courte durée (15 min), envoyé dans le corps de la
  réponse et attaché automatiquement par l'intercepteur Axios
  (`Authorization: Bearer`), gardé uniquement en mémoire (Zustand).
- **Refresh token** longue durée (7 jours), stocké **hashé** côté serveur
  (collection `RefreshToken`) avec rotation à chaque utilisation (l'ancien est
  invalidé ; toute réutilisation d'un token déjà consommé révoque toutes les
  sessions de l'utilisateur — détection de vol de token).
- **Différence clé avec le web** : un navigateur peut recevoir le refresh
  token via un cookie `httpOnly` inaccessible au JS. Une app mobile n'a pas de
  jar de cookies persistant fiable entre redémarrages ; le backend renvoie
  donc aussi le refresh token **dans le corps JSON**, et l'app le persiste
  dans le Keychain/Keystore chiffré via `expo-secure-store`. Les endpoints
  `/auth/refresh` et `/auth/logout` acceptent le token soit par cookie (web),
  soit par `refreshToken` dans le body (mobile) — changement additif, le flux
  web (s'il existe un jour) continue de fonctionner sans modification.
- Au démarrage de l'app, `app/_layout.tsx` lit le refresh token stocké et
  tente un rafraîchissement silencieux avant d'afficher l'interface —
  équivalent mobile du rafraîchissement au chargement de page côté web.

## Carte & suivi GPS temps réel

- **`useLiveTracking`** (`src/hooks/useLiveTracking.ts`) encapsule tout le
  cycle de vie d'un enregistrement : demande de permission (`expo-location`,
  au moment du `start()` seulement, pas au chargement de l'écran), abonnement
  `watchPositionAsync` (précision `BestForNavigation`, un point tous les
  ~5 m/2 s), calcul de la distance cumulée en direct côté client (formule de
  haversine, `src/utils/geo.ts`), et un filtre anti-bruit qui ignore tout saut
  GPS implausible (> 300 m entre deux points consécutifs).
- **Suivi premier plan uniquement** : le suivi s'arrête si l'app passe en
  arrière-plan/écran verrouillé. Un suivi en arrière-plan est possible en
  évolution future via `expo-task-manager` + `Location.startLocationUpdatesAsync`,
  mais demande une entitlement iOS "Always" spécifiquement justifiable en
  review App Store — hors périmètre pour l'instant.
- **`RunMap`** (`src/components/map/RunMap.tsx`) affiche une carte MapLibre
  avec un style OSM raster minimal (tuiles `tile.openstreetmap.org`, à
  remplacer par un fournisseur avec des conditions d'usage adaptées à la
  production — voir le commentaire dans le fichier), la position de
  l'utilisateur (`UserLocation`), et le trajet dessiné en direct
  (`ShapeSource`/`LineLayer`).
- À l'arrêt (`stop()`), l'écran affiche un résumé (distance/temps/allure) et
  permet de nommer puis d'enregistrer le footing via `POST /runs` — le
  backend recalcule les métriques finales (`avgSpeedKmh`, `avgPaceMinPerKm`,
  `calories`) à partir de `distanceKm`/`durationSec`, il ne fait pas confiance
  aux valeurs calculées côté client au-delà de l'affichage temps réel.
- MapLibre est un module natif absent d'Expo Go : depuis cette phase, le
  développement nécessite un *dev client* (`expo prebuild` +
  `expo run:android`/`run:ios`, voir `docs/INSTALLATION.md`).

## Gestion des parcours

- `Course` est saisi manuellement (nom, description, difficulté, distance,
  temps estimé) — pas d'outil de dessin d'itinéraire sur la carte pour
  l'instant. Le schéma prévoit un champ `route` optionnel pour une évolution
  future ("créer un parcours à partir d'un footing enregistré"), une fois que
  l'Historique (Phase 4) donne accès à la liste des footings passés.
- Un parcours est privé par défaut (`isPublic: false`) ; `POST
  /courses/:id/share` le marque comme public. `GET /courses` (liste) ne
  renvoie que les parcours de l'utilisateur courant ; le fil public listant
  les parcours partagés par d'autres utilisateurs (`GET /social/feed`) est
  arrivé en Phase 6 — voir la section "Social & Notifications" plus bas.
- Navigation mobile : l'onglet **Parcours** contient sa propre pile
  (`app/(app)/courses/_layout.tsx`, un `Stack` imbriqué dans l'onglet) pour
  gérer liste → détail → édition avec retour natif, plutôt que d'aplatir ces
  écrans au niveau des onglets. `CourseForm` est partagé entre création et
  édition pour éviter la duplication.

## Dashboard, historique, statistiques

- Toutes les métriques du tableau de bord (`GET /runs/stats/summary`) et des
  graphiques (`/weekly`, `/monthly`) sont calculées via des pipelines
  d'agrégation Mongo (`backend/src/services/stats.service.js`), jamais
  recalculées côté client à partir de la liste complète des footings.
  `/weekly` et `/monthly` renvoient des séries **zero-filled** (les
  semaines/mois sans activité apparaissent à 0 plutôt que d'être absents), ce
  qui donne un graphique continu sans traitement supplémentaire côté mobile.
- L'onglet **Tableau de bord** fusionne ce qui était initialement prévu comme
  deux sections séparées ("Tableau de bord" et "Statistiques" dans le cahier
  des charges) en un seul écran scrollable : cartes de totaux en haut, puis
  graphiques (`react-native-chart-kit`, choisi pour sa dépendance unique à
  `react-native-svg` déjà présente — pas de nouveau module natif à
  reconfigurer, contrairement à des alternatives basées sur Skia), puis
  records personnels. Ce regroupement évite une 6ᵉ entrée dans la barre
  d'onglets et suit le pattern d'apps comme Strava.
- La carte "Objectifs atteints" du tableau de bord est alimentée par `GET
  /goals` depuis la Phase 5 (voir plus bas).
- **Historique** : `GET /runs` (déjà utilisé pour l'enregistrement en Phase
  2) alimente la liste ; le détail réutilise `RunMap` en mode lecture seule
  (`fitToRoute`, la caméra cadre l'étendue du trajet enregistré au lieu de
  suivre la position actuelle de l'utilisateur) et expose le renommage
  (`PATCH /runs/:id`, déjà présent côté backend depuis la Phase 2) et la
  suppression.

## Objectifs

- Un `Goal` est considéré atteint dès qu'**un seul footing** couvre au moins
  `targetDistanceKm` — pas une distance cumulée sur plusieurs footings. Ce
  choix découle directement des presets, qui sont des distances de course
  (5 km, 10 km, semi-marathon, marathon) : l'objectif est "être capable de
  courir cette distance", pas "courir ce total sur la période".
- La progression (`bestDistanceKm`, `progressPercent`) est **recalculée à la
  volée** à chaque lecture (`goal.service.js#withProgress`), à partir des
  footings enregistrés depuis la création de l'objectif — un footing déjà
  présent avant la création de l'objectif ne compte pas rétroactivement, pour
  éviter qu'un objectif apparaisse atteint instantanément.
- Le passage à `achieved: true` est en revanche **stocké** (pas recalculé à
  chaque lecture) et déclenché une seule fois, juste après l'enregistrement
  d'un footing qui satisfait l'objectif
  (`run.service.js#createRun` → `goal.service.js#evaluateGoalsForRun`). C'est
  ce moment précis qui crée la `Notification` associée
  (`type: "goal_achieved"`).
- Le modèle `Notification` est introduit dès cette phase (juste la création,
  déclenchée par l'atteinte d'un objectif) car `Goal` en dépend ; l'interface
  de lecture des notifications et les autres déclencheurs (nouveau record,
  rappel d'entraînement) sont arrivés en Phase 6 — voir plus bas.
- Mobile : `app/(app)/goals.tsx` est un écran unique (liste + formulaire de
  création affiché/masqué en place) plutôt qu'une pile imbriquée comme
  Parcours ou Historique — un objectif n'a pas de vue détail ni d'édition,
  une `GoalCard` (barre de progression + action de suppression) suffit à
  tout afficher.

## Social & Notifications

- **Visibilité des parcours** : `getCourseById` (backend) autorise la
  lecture si l'utilisateur est propriétaire **ou** si le parcours est
  public ; les mutations (`update`/`share`/`delete`) passent par
  `getOwnedCourse`, strictement réservé au propriétaire. C'est cette
  distinction lecture/écriture qui permet à un autre utilisateur de
  consulter, aimer et commenter un parcours partagé sans pouvoir le modifier.
- **Likes** : stockés comme un tableau d'`ObjectId` sur `Course.likes`
  (présent depuis la Phase 3, resté inutilisé jusqu'ici). Pas de modèle
  séparé — `likesCount`/`likedByMe` sont calculés à la volée, jamais stockés.
- **Commentaires** : nouveau modèle `Comment` (référence vers `Course` +
  `User`), suppression réservée à l'auteur du commentaire (pas de modération
  par le propriétaire du parcours dans cette version).
- **Fil public** (`GET /social/feed`) : tous les parcours `isPublic: true`,
  toutes utilisateurs confondus, triés par date. Réutilise le même écran de
  détail que "Mes parcours" (`courses/[id]/index.tsx`) plutôt qu'un second
  écran dédié — les actions Modifier/Partager/Supprimer y sont simplement
  masquées si `course.user !== utilisateur courant`.
- **Notifications — nouveau record** : évalué juste après l'enregistrement
  d'un footing (`stats.service.js#evaluateRecordsForRun`), en comparant aux
  records *précédents* (donc en excluant le footing qu'on vient de créer).
  Ignoré pour le tout premier footing d'un utilisateur, qui serait
  trivialement "le plus long/rapide" sans qu'il y ait quoi que ce soit à
  battre — cela aurait généré 3 notifications dès l'inscription.
- **Notifications — rappel d'entraînement** : pas de scheduler/cron dans ce
  backend. Le rappel est calculé **paresseusement** à la lecture de `GET
  /notifications` (`notification.service.js#maybeCreateTrainingReminder`) :
  si aucun footing depuis 3 jours et pas déjà de rappel récent, un rappel est
  créé à cet instant. Idempotent par construction (la fenêtre de 3 jours sert
  aussi à ne pas en recréer un à chaque appel).
- **Cloche de notifications** : affichée sur le tableau de bord uniquement
  (pas de header partagé entre tous les onglets), avec un badge de compteur
  non-lu. `app/(app)/notifications.tsx` n'est pas déclaré comme onglet — on
  y accède par `router.push`, avec un bouton de fermeture manuel (pas de
  bouton retour natif automatique dans ce contexte).

## Sécurité — checklist

Vérifiée systématiquement en Phase 7 (audit complet des routes, des
dépendances, et test de bout en bout) :

- [x] **Authentification requise partout où nécessaire** : chaque fichier de
      routes protégé applique `router.use(requireAuth)` (ou `requireAuth`
      explicite) ; seuls `health`, `auth/register`, `auth/login`,
      `auth/refresh` et `auth/logout` sont publics par nature. Vérifié
      fichier par fichier.
- [x] **Autorisation par ressource (IDOR)** : toutes les requêtes sur les
      ressources d'un utilisateur (`runs`, `courses` en écriture, `goals`,
      `comments`) filtrent par `user: req.user._id` — testé explicitement
      avec deux comptes distincts (Phase 6) : un utilisateur ne peut ni lire
      un parcours privé d'autrui, ni modifier/supprimer une ressource qui ne
      lui appartient pas (404, pas de fuite d'existence).
- [x] **Mots de passe** : hashés avec bcrypt (12 rounds), jamais renvoyés
      (`select: false` + `toJSON` transform sur `User`).
- [x] **JWT** : access token courte durée (15 min) signé avec un secret
      dédié ; refresh token longue durée avec rotation à chaque utilisation
      et détection de réutilisation (révoque toutes les sessions si un
      refresh token déjà consommé est présenté à nouveau) ; stocké hashé
      (SHA-256 du `jti`) côté serveur, jamais en clair.
- [x] **Validation des entrées** : chaque route body/query est validée par
      un schéma Zod avant d'atteindre le contrôleur ; les erreurs de
      validation renvoient 400 avec le détail des champs en cause.
- [x] **Injection NoSQL** : `express-mongo-sanitize` appliqué globalement.
- [x] **En-têtes de sécurité** : `helmet()` appliqué globalement.
- [x] **Rate limiting** : limiteur global sur `/api/v1/*` + limiteur strict
      dédié sur les routes `/auth/*` (protection brute-force/credential
      stuffing).
- [x] **Upload d'avatar** : type MIME restreint (jpeg/png/webp), taille
      plafonnée (`MAX_AVATAR_SIZE_MB`), nom de fichier généré côté serveur
      (`crypto.randomUUID()`, jamais dérivé de l'entrée utilisateur — pas de
      path traversal possible), ancien avatar supprimé au remplacement.
- [x] **Secrets** : aucun secret par défaut faible n'est accepté pour
      `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (`env.js` lève une erreur au
      démarrage s'ils sont absents — pas de repli silencieux vers une valeur
      devinable) ; `.env` réels exclus de Git (`.gitignore`), seuls les
      `.env.example` sont versionnés ; audit `grep` sans secret en dur dans
      le code source.
- [x] **Docker** : conteneur backend exécuté par l'utilisateur non-root
      `node` (image `node:20-alpine`) ; MongoDB protégée par identifiants
      root, jamais exposée sans authentification.
- [x] **Erreurs** : la stack trace n'est renvoyée au client qu'en dehors de
      `NODE_ENV=production` (`error.middleware.js`).
- [x] **Dépendances** : `npm audit` sur le backend → 0 vulnérabilité.
      Côté mobile, `npm audit` remonte 24 avertissements, mais **tous**
      résident dans l'outillage CLI d'Expo (`@expo/prebuild-config`,
      `expo-dev-launcher`, `xcode`, `tar`, `postcss`...) utilisé uniquement
      au moment de `expo prebuild`/`expo run:*` sur la machine du
      développeur — ce code n'est jamais embarqué dans le bundle JS exécuté
      sur le téléphone. Le correctif proposé (`npm audit fix --force`)
      forcerait une mise à niveau majeure vers Expo SDK 57, ce qui
      requerrait React 19 et casserait la compatibilité soigneusement
      établie avec MapLibre (épinglé en 10.4.2) et react-native-chart-kit
      (épinglé en 6.12.3) — un compromis délibéré, à réévaluer lors d'une
      future migration de SDK plutôt que forcé ici.

**Non couvert, hors périmètre assumé** : pas de 2FA, pas de vérification
d'email à l'inscription, pas de limitation de débit par IP+utilisateur
combinés (seulement globale), pas de rotation automatique des secrets JWT en
production, pas de scan de dépendances automatisé en CI (pas de CI dans ce
projet).

**Notes connues, pas urgentes** : `multer@1.x` (upload d'avatar) est
déprécié en faveur de `multer@2.x` — la mise à niveau n'a pas été faite ici
car elle implique des changements d'API non triviaux à re-tester, et `npm
audit` ne remonte aucune CVE active sur la version installée. La limite de
corps de requête (`express.json({ limit: '1mb' })`) couvre confortablement
un trajet GPS de plusieurs heures (~55 octets/point, un point toutes les 2 s)
mais mérite d'être surveillée si le format des points évolue.

## Modèle de données

`User`, `RefreshToken`, `Run` (footing), `Course` (parcours), `Comment`, `Goal`
(objectif), `Notification` — voir `backend/src/models/*` (complété au fil des
phases).
