# FitQuest Frontend

React 19 + Vite app for FitQuest. See the [root README](../README.md) for the full project overview.

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to http://localhost:5000
npm run build
npm run lint
```

Set `VITE_API_URL` (see `.env.example`) to point at a deployed backend; otherwise `/api` is used.
