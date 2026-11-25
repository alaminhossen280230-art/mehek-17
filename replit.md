# Space Warp Experience

An interactive space-themed web app with a warp speed intro animation and a 3D orbital card system where users can click planets to view content.

## Run & Operate

- `pnpm --filter @workspace/space-warp run dev` — run the frontend (via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Tailwind CSS v4
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/space-warp/` — main frontend app
  - `src/App.tsx` — root component, phase state (warp → arriving → orbit), CARDS data
  - `src/components/WarpCanvas.tsx` — star warp speed canvas animation
  - `src/components/SolarSystem.tsx` — 3D orbiting card sphere, drag to rotate
  - `src/components/CardModal.tsx` — polaroid-style modal when a card is clicked
  - `public/` — GIFs and images used in card modals
- `artifacts/api-server/` — Express API server
- `lib/` — shared TypeScript libraries (api-client-react, api-zod, db)

## Architecture decisions

- Three-phase animation: warp → arriving → orbit, controlled by `Phase` state in App
- Cards orbit on a 3D sphere using spherical coordinates; drag rotates the whole scene
- Card content (title, description, GIFs, photos) all defined in the `CARDS` array in `App.tsx`
- Polaroid modal with pinboard aesthetic for displaying card content
- No router — single-page experience with phase-based rendering

## Product

- Warp speed star animation intro (2.2s warp + 1s deceleration)
- 6 orbiting cards on a draggable 3D sphere
- Click any card to open a polaroid-style content modal with GIFs and images
- Cards: Best Arcs, Great Separation Arc, Beefing Arcs, Memories, + 2 Coming Soon slots

## User preferences

- Imported from external Replit project (Animation-Helper)

## Gotchas

- Public assets (GIFs/images) live in `artifacts/space-warp/public/`
- To add a new card, add an entry to the `CARDS` array in `App.tsx` and add its assets to `public/`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
