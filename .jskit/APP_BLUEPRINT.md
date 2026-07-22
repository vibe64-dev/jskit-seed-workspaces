# App Blueprint

<!-- vibe64-blueprint-covered-commit: 66d565dd4495b0cbb0b09ad44ed6cc6f133ee368 -->

## Product foundation

App is a deliberately blank JSKIT foundation for future products. People use database-backed local accounts and receive one automatically provisioned personal workspace. The seed includes no AI assistant, product CRUD, collaboration flow, uploads, realtime behavior, payments, mobile packaging, or demo data as an application feature.

The smallest supported browser flow is:

1. Register or sign in with a local account.
2. Land on `/home` and open the account's single personal workspace.
3. See the blank workspace at `/w/:workspaceSlug` and optionally open its Admin surface from the profile menu.
4. Sign out and return to the local login screen.

`/home` does not automatically redirect into the workspace. The workspace page explains that a future collaboration-only product may choose to redirect to its Admin surface.

## Runtime and providers

- Runtime: Node.js, Fastify, Vue, Vue Router, Vite, Vuetify, and the JSKIT shell.
- Authentication: JSKIT local username/password auth with `AUTH_PROVIDER=local` and `AUTH_LOCAL_BACKEND=db`.
- Database: MariaDB through `@jskit-ai/database-runtime` and `@jskit-ai/database-runtime-mysql`.
- Local-auth persistence: `@jskit-ai/auth-provider-local-db-core`.
- Users: `@jskit-ai/users-core`, `@jskit-ai/users-web`, and the generated `@local/users` CRUD package.
- Workspaces: `@jskit-ai/workspaces-core` and `@jskit-ai/workspaces-web` with `tenancyMode: "personal"`.
- HTTP and durable resources use JSKIT providers and JSON:API/resource packages; feature code must not bypass them with direct Knex access.

Vibe64 supplies `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Do not commit credentials or replace the managed database with an app-local store.

## Package ownership

- `packages/main` is composition and lightweight app glue only. Substantial server behavior belongs in a dedicated JSKIT-generated feature package.
- `packages/users` is the generated owner of the baseline `users` CRUD resource, repository, service, actions, and routes.
- `migrations/` contains JSKIT-managed user, workspace, and local-auth migrations. Create or refresh framework-owned persistence through JSKIT commands rather than hand-writing migrations.
- `config/public.js` owns surface and public workspace behavior. `config/server.js` owns server-side auth/workspace defaults.
- Client pages stay thin and call JSKIT composables for route and workspace state.

## Surfaces and decisions

- `home`: public shell and service-health landing page at `/home`.
- `auth`: local login, registration, reset-password, and sign-out views.
- `account`: authenticated account settings.
- `app`: workspace-member surface rooted at `/w/[workspaceSlug]`.
- `admin`: workspace-member surface rooted at `/w/[workspaceSlug]/admin`.

The workspace landing page is intentionally blank and exposes the Admin surface through the profile menu. The generated Admin landing page includes Members and Settings shortcuts with workspace-scoped absolute routes.

Workspace invitations are disabled in both public and server configuration, including personal mode, and new workspace settings default to invitations disabled. Generated invitation implementation files may still exist as installed package output, but the capability is not exposed in the supported UI.

Workspace access is membership-scoped. A signed-in user must not be able to open another user's personal workspace.

## Common commands

```bash
npm install
npm run db:migrate
npm run db:migrate:status
npm run build
npm run verify
```

Inside Vibe64, use only the managed preview and browser tooling:

```bash
vibe64-preview ensure --wait --json
vibe64-playwright test tests/e2e/personal-workspace.spec.ts
```

After the final browser-visible change, record the required receipt before final verification:

```bash
npx jskit app verify-ui \
  --command "vibe64-playwright test tests/e2e/personal-workspace.spec.ts" \
  --feature "database-backed personal workspace sign-in" \
  --auth-mode custom-local
```

The receipt is stored at `.jskit/verification/ui.json`. Browser tests require `PLAYWRIGHT_BASE_URL`; Vibe64 supplies it through `vibe64-playwright`.

## Verification and known limits

The personal-workspace E2E test uses two deterministic development accounts. It covers sign-in or registration, a single workspace per account, responsive layout, the blank workspace, profile-menu Admin navigation, workspace-scoped Admin shortcuts, cross-user workspace isolation, and sign-out.

The full JSKIT verifier currently passes. JSKIT doctor reports one low-risk generated ownership warning for `packages/main/src/server/email/workspaceInviteEmail.js`; invitations are disabled, so this helper is not part of the supported runtime flow. Product features, deployment behavior, and production credentials remain intentionally undefined.
