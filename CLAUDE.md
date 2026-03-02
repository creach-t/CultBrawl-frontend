# CLAUDE.md — CultBrawl Frontend

Instructions pour Claude Code lors des modifications de ce projet.

---

## Contexte du projet

Application mobile React Native / Expo pour voter entre deux œuvres culturelles. Navigation file-based via Expo Router. API backend sur `http://<IP>:3000/api`.

---

## Conventions de code

### Style général
- **Langage** : TypeScript (`.tsx` / `.ts`), pas de `.js` dans `app/` ou `components/`
- **Composants** : fonctionnels uniquement, avec `React.FC<Props>` ou inférence de type
- **Imports** : chemins relatifs (`../services/api`), pas d'alias `@/`
- **Styles** : `StyleSheet.create()` en bas de chaque fichier, pas d'inline styles complexes
- **Pas de console.log** en production (supprimer avant commit)

### State management
- État global utilisateur : `UserContext` (`context/UserContext.tsx`)
- Données serveur : **React Query** via les hooks dans `hooks/`
- État local des composants : `useState` / `useReducer`

### Appels API
- Toujours passer par l'instance Axios `api` de `services/api.js`
- Ne jamais appeler `fetch` directement
- Gérer les erreurs avec `try/catch`, afficher un toast en cas d'échec

### Navigation
- Utiliser `router.push('/route')` ou `router.replace('/route')` d'Expo Router
- Ne pas utiliser `useNavigation` de React Navigation directement
- Les routes protégées doivent vérifier `user` depuis `useUser()` et rediriger si absent

---

## Format de la réponse API batailles

Le backend renvoie les batailles dans ce format depuis `GET /api/battles` :

```ts
{
  id: number,
  title: string,           // "Nom1 vs Nom2"
  category: string,        // type de l'entité 1
  participants: Entity[],  // [entity1, entity2]
  endTime: string,         // ISO date
  status: 'pending' | 'completed' | 'cancelled'
}
```

`cardBattle.tsx` est adapté à ce format (`battle.participants[0/1]`, `battle.endTime`).
`BattleCard.tsx` attend `battle.Entity1/Entity2/endDate` — format différent.

---

## Composants principaux

### `cardBattle.tsx` (utilisé dans battlelist)
- Props : `battle` (format API), `user` (depuis UserContext), `isAdmin` (bool), `onDelete` (callback)
- Gère le vote via `POST /battles/:id/votes`
- Affiche les stats via `GET /battles/:id/votes`
- Vérifie si l'utilisateur a voté via `GET /battles/:id/user-vote`
- Bouton delete visible si `isAdmin === true` (corbeille en haut à droite)

### `VoteButton.tsx`
- Props : `battleId`, `entityId`, `entityName`, `onVoteSuccess`, `onVoteChange`

### `VoteStatsDisplay.tsx`
- Props : `battleId`, `refreshTrigger` (incrémenté après un vote)

---

## Règles métier

- Un utilisateur ne peut voter qu'une fois par bataille
- Voter coûte 0 point et rapporte **+500 points**
- Créer une bataille coûte **10 points** (vérifié côté backend)
- Le statut `pending` = bataille en cours de vote
- Le statut `completed` = bataille terminée (lecture seule)

---

## UserContext — API

```ts
const { user, setUser, refreshUser } = useUser();

// user : { id, username, points, token, roleId, ... } | null
// refreshUser() : recharge depuis GET /api/users + AsyncStorage
```

---

## Hooks custom

- `hooks/useIsAdmin.ts` : retourne `user?.roleId === 2` depuis le UserContext

---

## Gestion des dialogues de confirmation (multi-plateforme)

Sur web, `Alert.alert` avec plusieurs boutons est silencieux (bug React Native Web).
**Toujours utiliser ce pattern** pour les actions destructives :

```ts
if (Platform.OS === 'web') {
  if (window.confirm('Confirmer ?')) doAction();
} else {
  Alert.alert('Titre', 'Message', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Confirmer', style: 'destructive', onPress: doAction },
  ]);
}
```

---

## Points d'attention

- **baseURL hardcodée** dans `services/api.js` → changer l'IP pour chaque environnement
- **`roleId` doit être stocké** au login dans AsyncStorage pour que `useIsAdmin` fonctionne
- **Deux composants bataille** : `cardBattle.tsx` (actif) et `BattleCard.tsx` (avancé, non utilisé dans battlelist) — ne pas supprimer BattleCard sans vérifier toutes les imports
- Le rafraîchissement automatique de battlelist est de **30 secondes** (`setInterval` dans `useFocusEffect`)
- JWT stocké dans AsyncStorage — expiration 1h sans refresh

---

## Structure des screens (Expo Router)

Tous les fichiers dans `app/` deviennent des routes automatiquement :

```
app/index.tsx        → /
app/auth.tsx         → /auth
app/signup.tsx       → /signup
app/battlelist.tsx   → /battlelist
app/battle-detail.tsx → /battle-detail
app/leaderboard.tsx  → /leaderboard
app/addbattle.tsx    → /addbattle
app/addentity.tsx    → /addentity
app/account.tsx      → /account
```

La visibilité des onglets est définie dans `app/_layout.tsx`.

---

## Commandes utiles

```bash
npm start            # Expo Go (scan QR)
npm run android      # Émulateur Android
npm run ios          # Simulateur iOS (Mac requis)
npm run web          # Navigateur web
npm test             # Tests Jest
npm run lint         # Lint Expo
```
