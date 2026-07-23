# SkyRun 🏃‍♂️

Application moderne de suivi de footing (running tracker) : carte GPS temps réel,
gestion de parcours, historique, statistiques, objectifs et fonctionnalités
sociales — inspirée de Strava, Nike Run Club et Garmin Connect.

> **Statut** : toutes les phases prévues sont livrées (voir [Roadmap](#roadmap)).
> Le client est une **application mobile React Native / Expo** (Android & iOS) ;
> il n'y a pas de client web.

## Stack technique

| Couche          | Technologies                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| Mobile           | React Native, Expo, Expo Router, TypeScript, TanStack Query, Zustand, Axios     |
| Cartographie     | MapLibre GL Native + OpenStreetMap, Expo Location (suivi GPS temps réel)              |
| Mobile — natif   | Expo Location, Expo Secure Store, Reanimated, Gesture Handler, Expo Blur          |
| Backend          | Node.js, Express (ES modules), architecture MVC + services                         |
| Base de données  | MongoDB + Mongoose                                                                   |
| Auth             | JWT (access court) + Refresh Token (rotation, cookie **et** body pour mobile)          |
| Sécurité         | Helmet, CORS, express-rate-limit, express-mongo-sanitize, bcrypt                        |
| Documentation    | Swagger / OpenAPI (`/api-docs`)                                                           |
| Infra            | Docker, Docker Compose (MongoDB + API)                                                     |

## Démarrage rapide

Prérequis : Docker + Docker Compose, Node.js ≥ 20, un environnement de build
mobile (Android Studio et/ou Xcode) pour générer le *dev client* — voir
[`docs/INSTALLATION.md`](docs/INSTALLATION.md) pour le détail.

### 1. Backend (Docker)

```bash
git clone <repo-url> skyrun && cd skyrun
cp .env.example .env
cp backend/.env.example backend/.env
# -> éditer .env et backend/.env : générer des secrets JWT forts
#    (ex: openssl rand -hex 64) et un mot de passe MongoDB.

docker compose up --build
```

- API : http://localhost:5000/api/v1
- Documentation API (Swagger) : http://localhost:5000/api-docs
- Health check : http://localhost:5000/api/v1/health

### 2. App mobile (Expo)

```bash
cd mobile
cp .env.example .env
# -> éditer EXPO_PUBLIC_API_BASE_URL avec l'IP locale de votre machine
#    (ex: http://192.168.1.10:5000/api/v1) ; "localhost" ne fonctionne pas
#    depuis un téléphone physique ou un émulateur Android.
npm install
npx expo prebuild
npx expo run:android   # ou: npx expo run:ios
```

> L'app utilise MapLibre (carte OpenStreetMap) et Expo Location, des modules
> natifs absents d'**Expo Go** : depuis la Phase 2, il faut un *dev client*
> généré par `expo prebuild` (voir [`docs/INSTALLATION.md`](docs/INSTALLATION.md)).
> Une fois le dev client installé sur l'appareil/émulateur, `npx expo start`
> suffit pour les lancements suivants — seul un changement de module natif
> demande de relancer `run:android`/`run:ios`.

## Scripts npm

| Dossier   | Script            | Description                                     |
| ---------- | ----------------- | ------------------------------------------------ |
| `backend`  | `npm run dev`     | Démarre l'API avec rechargement à chaud (nodemon) |
| `backend`  | `npm start`       | Démarre l'API en mode production                  |
| `backend`  | `npm test`        | Lance `node --test` — aucun test automatisé écrit pour l'instant, scaffold prêt |
| `mobile`   | `npm run start`   | Démarre le serveur Metro (dev client déjà installé sur l'appareil) |
| `mobile`   | `npm run android` | Build + installe le dev client, puis lance sur Android |
| `mobile`   | `npm run ios`     | Build + installe le dev client, puis lance sur iOS     |
| `mobile`   | `npm run web`     | Aperçu rapide dans un navigateur (non ciblé en production) |

## Variables d'environnement

Voir [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) pour le détail de chaque variable
(`.env` racine pour Docker Compose, `backend/.env`, `mobile/.env`).

## Architecture

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour le détail de l'organisation
des dossiers, du flux de requêtes et des choix de conception (auth mobile,
sécurité, données).

## Documentation API

L'API REST (`/api/v1`) est documentée via Swagger/OpenAPI, générée automatiquement à
partir des annotations JSDoc dans les fichiers de routes — voir
[`docs/API.md`](docs/API.md) et l'interface interactive `/api-docs`.

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion, profil, avatar
- **Tableau de bord** : distance totale, temps total, nombre de footings, calories,
  allure moyenne, objectifs atteints
- **Carte** : position actuelle, tracé du trajet en temps réel, enregistrement GPS
  automatique (MapLibre / OpenStreetMap)
- **Parcours** : création, modification, suppression, partage
- **Historique** : détail de chaque footing (date, distance, temps, allure, carte, calories)
- **Statistiques** : km/semaine, km/mois, progression, records personnels
- **Objectifs** : 5 km, 10 km, semi-marathon, marathon, avec suivi de progression
- **Social** : partage, likes, commentaires sur les parcours
- **Notifications** : objectif atteint, nouveau record, rappel d'entraînement

## Roadmap

- [x] Phase 0 — Socle & infrastructure backend (Docker, Express, sécurité)
- [x] Phase 1 — Authentification & profil (backend + app mobile Expo)
- [x] Phase 2 — Carte & suivi GPS temps réel (MapLibre, Expo Location)
- [x] Phase 3 — Gestion des parcours
- [x] Phase 4 — Dashboard, historique, statistiques
- [x] Phase 5 — Objectifs
- [x] Phase 6 — Social & notifications
- [x] Phase 7 — Finitions & documentation complète

## Licence

Projet privé — tous droits réservés.
