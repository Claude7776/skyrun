# SkyRun Mobile

Application mobile (Expo / React Native) de suivi de course à pied : tracking GPS en direct, historique, objectifs, statistiques et fonctionnalités sociales.

## Stack

- [Expo](https://expo.dev) SDK 52 (managed workflow + `expo-dev-client`)
- [Expo Router](https://docs.expo.dev/router/introduction/) pour la navigation
- React Native 0.76 / React 18
- [Zustand](https://github.com/pmndrs/zustand) pour le state global
- [TanStack Query](https://tanstack.com/query) pour les appels API
- [@maplibre/maplibre-react-native](https://github.com/maplibre/maplibre-react-native) pour la carte (module natif — nécessite un dev client, incompatible avec Expo Go)

## Prérequis

- Node.js et npm
- Un compte [Expo](https://expo.dev) (gratuit) pour EAS Build
- Un téléphone Android avec le **dev client SkyRun** installé (voir ci-dessous) — l'app utilisant des modules natifs (maplibre), **Expo Go seul ne suffit pas**

## Installation

```bash
npm install
cp .env.example .env
```

Éditez `.env` et renseignez `EXPO_PUBLIC_API_BASE_URL` avec une URL accessible depuis votre téléphone (IP LAN de votre machine, pas `localhost`) :

```
EXPO_PUBLIC_API_BASE_URL=http://<IP_LAN_DE_VOTRE_MACHINE>:5000/api/v1
```

## Lancer le projet en développement

```bash
npm start
```

Ouvrez ensuite l'app sur votre téléphone via le dev client (scan du QR code affiché, ou saisie manuelle de `exp://<IP_LAN>:8081`).

Si le téléphone ne peut pas joindre le serveur en réseau local (pare-feu, isolation Wi-Fi), utilisez le mode tunnel :

```bash
npx expo start --tunnel
```

## Construire le dev client Android (EAS Build)

Le projet embarque `expo-dev-client`. Pour builder un APK installable sur téléphone (nécessaire car Expo Go ne supporte que la dernière version de SDK) :

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android
```

Une fois le build terminé, installez l'APK depuis le lien fourni par EAS, puis relancez `npm start` et ouvrez l'app depuis le dev client installé.

## Structure du projet

```
app/                 Écrans (Expo Router)
src/
  api/                Appels API (auth, courses, goals, runs, social...)
  components/          Composants réutilisables (ui, map)
  features/            Logique par fonctionnalité (auth, dashboard, tracking...)
  hooks/                Hooks partagés (ex: useLiveTracking)
  store/                State global (Zustand)
  styles/               Thème
  types/                Types TypeScript partagés
  utils/                Fonctions utilitaires
```

## Scripts

| Commande | Description |
|---|---|
| `npm start` | Démarre le serveur Metro |
| `npm run android` | Build + lance sur Android (nécessite Android SDK en local) |
| `npm run ios` | Build + lance sur iOS (nécessite macOS) |
| `npm run web` | Lance la version web |
| `npm run lint` | Lint du projet |
