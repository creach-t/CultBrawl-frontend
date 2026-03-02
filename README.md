# CultBrawl — Frontend

Application mobile React Native / Expo pour la plateforme de versus culturel CultBrawl. Les utilisateurs votent entre deux œuvres culturelles (films, livres, séries, jeux, anime…) et gagnent des points.

## Stack

- **Framework** : React Native + Expo SDK 52
- **Navigation** : Expo Router (file-based routing)
- **Data fetching** : TanStack React Query v5
- **HTTP** : Axios
- **UI** : React Native Paper
- **Langage** : TypeScript
- **Auth** : JWT stocké en AsyncStorage

---

## Prérequis

- Node.js ≥ 18
- npm
- Expo Go (sur iOS ou Android) **ou** émulateur Android/iOS
- Backend CultBrawl démarré sur le port 3000

---

## Installation

```bash
cd cultbrawl-frontend
npm install
```

### Configurer l'URL de l'API

Éditer `services/api.js` et remplacer la baseURL par l'IP de ta machine :

```js
// services/api.js
baseURL: 'http://192.168.X.X:3000/api'
// ou pour le simulateur iOS/Android
baseURL: 'http://localhost:3000/api'
```

---

## Démarrage

```bash
# Expo (scan QR code avec Expo Go)
npm start

# Android (émulateur ou appareil)
npm run android

# iOS (Mac requis)
npm run ios

# Web
npm run web
```

---

## Architecture

```
cultbrawl-frontend/
├── app/                        # Écrans (Expo Router — file-based routing)
│   ├── _layout.tsx             # Root layout : providers + navigation tabs
│   ├── index.tsx               # Accueil
│   ├── auth.tsx                # Connexion
│   ├── signup.tsx              # Inscription
│   ├── battlelist.tsx          # Liste des batailles (rafraîchissement 30s)
│   ├── battle-detail.tsx       # Détail d'une bataille
│   ├── leaderboard.tsx         # Classement utilisateurs
│   ├── addbattle.tsx           # Créer une bataille
│   ├── addentity.tsx           # Ajouter une entité culturelle
│   ├── addmovie.tsx            # Ajouter un film
│   └── account.tsx             # Compte utilisateur
│
├── components/
│   ├── cardBattle.tsx          # Carte bataille (utilisée dans battlelist)
│   ├── BattleCard.tsx          # Carte bataille avancée (avec Entity1/Entity2)
│   ├── VoteButton.tsx          # Bouton de vote
│   ├── VoteStatsDisplay.tsx    # Barres de statistiques de vote
│   ├── BattleParticipant.tsx   # Affichage d'un participant
│   ├── BattleProgressBar.tsx   # Barre de progression
│   ├── BattleStatus.tsx        # Badge de statut
│   └── Toast.tsx               # Notification toast
│
├── services/
│   ├── api.js                  # Instance Axios (baseURL, intercepteurs token/401)
│   ├── battleService.ts        # Appels API batailles (TypeScript)
│   └── voteService.ts          # Appels API votes (TypeScript)
│
├── context/
│   ├── UserContext.tsx         # État utilisateur global (points, token)
│   ├── AuthContext.tsx         # Contexte d'authentification
│   └── MessageContext.tsx      # Notifications globales
│
├── hooks/
│   ├── useBattles.ts           # Hook React Query pour les batailles
│   ├── useToast.ts             # Hook toast
│   ├── useColorScheme.ts       # Thème clair/sombre
│   └── useThemeColor.ts        # Couleurs par thème
│
├── constants/                  # Couleurs et thèmes
├── utils/                      # Fonctions utilitaires
└── assets/                     # Images, icônes, polices
```

---

## Navigation

La navigation est gérée via **Expo Router** (file-based). Les onglets visibles sont définis dans `app/_layout.tsx`.

| Écran | Route | Accès |
|---|---|---|
| Accueil | `/` | Public |
| Batailles | `/battlelist` | Public |
| Classement | `/leaderboard` | Public |
| Connexion | `/auth` | Public |
| Inscription | `/signup` | Public |
| Compte | `/account` | Connecté |
| Créer bataille | `/addbattle` | Connecté |
| Ajouter entité | `/addentity` | Connecté |

---

## Authentification

- Le JWT est stocké dans `AsyncStorage` après connexion
- `UserContext` charge automatiquement l'utilisateur au démarrage
- Les intercepteurs Axios ajoutent le header `Authorization: Bearer <token>` à chaque requête
- Une réponse 401 efface le token et redirige vers `/auth`
- Expiration : **1 heure** (pas de refresh token)

---

## Système de points

| Action | Points |
|---|---|
| Créer une bataille | **-10** |
| Voter dans une bataille | **+500** |

Les points sont mis à jour en temps réel dans `UserContext` après chaque action.

---

## Lancer les tests

```bash
npm test
```

---

## Points d'attention

- `services/api.js` : baseURL hardcodée → changer l'IP selon l'environnement
- Deux composants de carte bataille coexistent (`cardBattle.tsx` et `BattleCard.tsx`) — `battlelist.tsx` utilise `cardBattle.tsx`
- Le rafraîchissement automatique sur la liste des batailles est de 30s (configurable dans `battlelist.tsx`)
- JWT stocké en clair dans AsyncStorage (pas de keychain)
