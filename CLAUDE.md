# Development Workflow

## Branch & PR Policy

**ALWAYS create a branch + PR for code changes. Never commit directly to `main`.**

1. Create a new branch for each change/task
2. Commit changes to the feature branch
3. Open a PR for Samuel to review and merge

## Code Style

- Use TypeScript with React + Vite
- Use `cn()` from `@/lib/utils` for class merging
- Use shadcn/ui components from `@/components/ui/`
- Prefer `Sheet`, `Drawer`, `Popover` for overlays
- Mobile-first responsive design

## Deployment

- Vercel auto-deploys on merge to `main`
- Feature branches get preview deployments
