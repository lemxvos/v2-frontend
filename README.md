# Continuum Frontend v2

React + TypeScript + Vite frontend para o Continuum backend v11.

## Stack

- **React 18** + TypeScript
- **Vite** (build / dev server)
- **Tailwind CSS** (dark theme — #0a0a0b base)
- **React Router v6** (rotas)
- **Zustand** (estado global)
- **TanStack Query** (cache de servidor)
- **Axios** (HTTP com interceptor JWT automático)
- **Sonner** (toasts)
- **date-fns** (datas)
- **Lucide React** (ícones)

## Setup

```bash
cp .env.example .env
# edite .env com suas configurações

npm install
npm run dev
```

## Rotas

| Rota                | Página           | Descrição                           |
|---------------------|------------------|-------------------------------------|
| `/login`            | Login            | Autenticação                        |
| `/register`         | Register         | Criar conta                         |
| `/dashboard`        | Dashboard        | Overview + stats + check-ins hoje   |
| `/journal`          | Journal          | Lista de entradas por data          |
| `/journal/new`      | JournalEditor    | Nova entrada com @menções           |
| `/journal/:id`      | JournalEditor    | Editar entrada (autosave)           |
| `/habits`           | Habits           | 🆕 Check-in diário + streaks + heatmap |
| `/entities`         | AllEntities      | Todas as entidades por tipo         |
| `/entities/new`     | EntityCreate     | Criar com configuração de tracking  |
| `/entities/:id`     | EntityDetail     | Timeline de menções + stats tracking|
| `/connections`      | Connections      | Ranking de menções globais          |
| `/search`           | Search           | Busca full-text de entidades        |
| `/settings`         | Settings         | Conta + uso + assinatura            |
| `/upgrade`          | Upgrade          | Checkout Stripe                     |

## Endpoints consumidos (v11 backend)

Todos os endpoints estão 100% alinhados com o backend v11:

- `POST /auth/register` + `/auth/login` + `/auth/me`
- `GET|POST|PUT|DELETE /api/notes` (sem paginação — usa `folderId`, `rootOnly`, `days`)
- `GET /api/notes/recent`
- `PATCH /api/notes/:id/move`
- `GET|POST|PUT|DELETE /api/entities`
- `GET /api/entities/search`, `/api/entities/archived`
- `POST /api/entities/:id/restore`
- `POST /api/entities/:entityId/track` — body: `{date, value, decimalValue, note}`
- `DELETE /api/entities/:entityId/track?date=yyyy-MM-dd`
- `GET /api/entities/:entityId/heatmap?from=&to=`
- `GET /api/entities/:entityId/stats`
- `GET /api/tracking/today`
- `GET /api/metrics/dashboard`
- `GET /api/metrics/entities/:entityId/timeline`
- `GET|POST|PATCH|DELETE /api/folders`
- `GET /api/subscriptions/me`
- `POST /api/subscriptions/checkout` + `/cancel`

## Correções vs v1

| Problema | Correção |
|----------|----------|
| `entityService.update` usava `PATCH` | Corrigido para `PUT` |
| `noteService.create` mandava `title` | Corrigido para `content + folderId` |
| `noteService.list` mandava `page/pageSize` | Corrigido para `folderId/rootOnly/days` |
| `trackingService` chamava `/api/entities/${id}/track` | ✅ já estava correto |
| `/api/metrics/insights` não existe | Removido |
| `/api/metrics/network` não existe | Removido |
| `/api/entities/${id}/related` não existe | Removido |
| Sem rota `/habits` | 🆕 Adicionado |
| Sem check-in dialog com valor numérico | 🆕 Adicionado |
| Sem heatmap de 28 dias nos hábitos | 🆕 Adicionado |
| Nav sem Hábitos | 🆕 Adicionado |
| `folderService` não existia no frontend | 🆕 Adicionado |
