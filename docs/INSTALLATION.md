# Installation

## 1. Backend + base de données (Docker)

**Prérequis** : Docker Engine + Docker Compose v2.

```bash
git clone <repo-url> skyrun && cd skyrun
cp .env.example .env
cp backend/.env.example backend/.env
```

Éditer `.env` et `backend/.env` :
- Générer des secrets JWT forts : `openssl rand -hex 64`
- Définir un mot de passe MongoDB robuste

```bash
docker compose up --build
```

Services disponibles :
- API : http://localhost:5000/api/v1
- Swagger : http://localhost:5000/api-docs

Arrêter : `docker compose down` (ajouter `-v` pour supprimer aussi les volumes,
donc les données Mongo et les avatars uploadés).

### Alternative sans Docker

```bash
docker run -d --name skyrun-mongo -p 27017:27017 mongo:7

cd backend
cp .env.example .env      # MONGO_URI=mongodb://127.0.0.1:27017/skyrun
npm install
npm run dev                # démarre sur http://localhost:5000
```

## 2. Application mobile (Expo)

**Prérequis** : Node.js ≥ 20, un appareil ou émulateur/simulateur Android
(Android Studio) et/ou iOS (Xcode, macOS uniquement). **Expo Go seul ne
suffit pas** — l'app utilise des modules natifs (MapLibre) qui exigent un
*dev client*, voir plus bas.

```bash
cd mobile
cp .env.example .env
```

Éditer `mobile/.env` : `EXPO_PUBLIC_API_BASE_URL` doit pointer vers une URL que
votre téléphone/émulateur peut réellement atteindre — l'IP locale de votre
machine (pas `localhost`), par ex. `http://192.168.1.10:5000/api/v1`.

```bash
npm install
```

> Les versions de dépendances dans `package.json` sont un point de départ
> cohérent (SDK Expo 52). Avant de builder, faites tourner
> `npx expo install --fix` pour aligner précisément toutes les versions sur
> le SDK Expo réellement installé.

### Dev client (requis dès maintenant)

L'app utilise MapLibre (carte OpenStreetMap) et Expo Location, des modules
natifs absents d'**Expo Go** — `npm run start` seul ne suffit pas. Il faut un
client de développement personnalisé :

```bash
npx expo prebuild
npx expo run:android   # ou: npx expo run:ios
```

Cela génère les dossiers natifs `android/` et `ios/` (ignorés par Git) et
installe une app de dev sur votre appareil/émulateur ; à relancer après tout
changement de module natif (ajout d'un package natif, modification
d'`app.json`), mais pas pour les changements de code JS/TS classiques, qui
continuent de se recharger à chaud via `npx expo start`.

## Vérifier l'installation

- `GET http://localhost:5000/api/v1/health` doit renvoyer `{ "data": { "status": "ok", "database": "connected" } }`.
- Dans l'app mobile, l'onglet **Tableau de bord** doit afficher "API
  opérationnelle" et "MongoDB connectée" après connexion.
- L'onglet **Carte** doit afficher les tuiles OpenStreetMap et votre position ;
  "Démarrer" doit dessiner le trajet en direct, et "Enregistrer" après
  "Arrêter" doit faire apparaître le footing via `GET /api/v1/runs`.
