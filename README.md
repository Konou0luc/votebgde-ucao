# VoteBGDE Frontend

Base frontend initialisee avec:

- React + TypeScript + Vite
- TailwindCSS v4
- React Router
- TanStack Query
- Zustand
- Axios
- Framer Motion
- Lucide Icons

## Lancer le projet

```bash
npm install
npm run dev
```

## Variable d environnement

Creer un fichier `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_PATH=/.....................
```

## Structure initiale

```text
src/
  app/
  modules/
    student-vote/
    admin-dashboard/
    auth/
  pages/
  routes/
  shared/
    api/
    constants/
    hooks/
    layouts/
    state/
    types/
    ui/
    utils/
```

## Ecrans disponibles

- `/` landing institutionnelle (topbar, hero, footer)
- `/vote` flow etudiant complet (matricule, OTP, listes, confirmation)
- endpoint admin prive via `VITE_ADMIN_PATH` (non expose dans l UI etudiante)
