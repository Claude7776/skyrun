# Variables d'environnement

Trois fichiers `.env` distincts (chacun avec son `.env.example`) :

## `.env` (racine — Docker Compose)

| Variable                       | Description                                                | Exemple                     |
| -------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| `BACKEND_PORT`                     | Port hôte exposé pour l'API                                     | `5000`                          |
| `MONGO_INITDB_ROOT_USERNAME`         | Utilisateur root MongoDB                                          | `skyrun`                          |
| `MONGO_INITDB_ROOT_PASSWORD`           | Mot de passe root MongoDB — **à changer**                          | `openssl rand -hex 24`             |
| `MONGO_DB_NAME`                          | Nom de la base                                                       | `skyrun`                             |
| `CORS_ORIGIN`                              | Origine autorisée par CORS — sans effet sur l'app mobile, ne concerne qu'un futur client web | `http://localhost:8081` |

## `backend/.env`

| Variable                  | Description                                                        |
| -------------------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`                  | `development` \| `production`                                            |
| `PORT`                        | Port d'écoute de l'API                                                     |
| `API_PREFIX`                    | Préfixe des routes REST (`/api/v1`)                                          |
| `MONGO_URI`                       | URI de connexion MongoDB (surchargée par Docker Compose)                       |
| `CORS_ORIGIN`                       | Origine autorisée par CORS (futur client web uniquement)                          |
| `JWT_ACCESS_SECRET`                   | Secret de signature de l'access token — **générer avec `openssl rand -hex 64`**    |
| `JWT_ACCESS_EXPIRES_IN`                 | Durée de vie de l'access token (`15m`)                                              |
| `JWT_REFRESH_SECRET`                      | Secret de signature du refresh token — distinct du précédent                          |
| `JWT_REFRESH_EXPIRES_IN`                    | Durée de vie du refresh token (`7d`)                                                    |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`     | Fenêtre et plafond du rate limiting global                                                |
| `AUTH_RATE_LIMIT_MAX`                            | Plafond spécifique aux routes `/auth`                                                       |
| `UPLOAD_DIR`                                       | Dossier de stockage des avatars                                                               |
| `MAX_AVATAR_SIZE_MB`                                 | Taille maximale d'un avatar uploadé                                                             |
| `LOG_LEVEL`                                            | Niveau de log Winston (`info`, `debug`, ...)                                                       |

## `mobile/.env`

| Variable                     | Description                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`       | URL complète de l'API (`http://<ip-locale>:5000/api/v1` en dev, URL HTTPS publique en production). Le préfixe `EXPO_PUBLIC_` est requis par Expo pour exposer une variable au bundle JS. |

> **Astuce dev mobile** : `localhost` ne fonctionne que si vous testez dans un
> simulateur iOS sur le même Mac. Pour un téléphone physique ou un émulateur
> Android, utilisez l'IP locale de votre machine (`ipconfig`/`ifconfig`) ou
> lancez `npx expo start --tunnel`.

> **Sécurité** : ne jamais committer de fichier `.env` réel — seuls les `.env.example`
> sont versionnés. Générer des secrets forts et uniques par environnement.
