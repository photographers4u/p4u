
## Git Commit Rules

### Format

```
<type>(<scope>): <short message>

- bullet point body when multiple changes
- each bullet starts with a verb
- explain what and why, not how
```

### Types

```
feat      → new feature
fix       → bug fix
docs      → documentation only
style     → formatting, no logic change
refactor  → restructure, no feature/fix
test      → adding/fixing tests
chore     → deps, build, tooling
perf      → performance improvement
ci        → CI/CD changes
revert    → reverting a commit
```

### Common Scopes

```
feat(ui):         → frontend / component changes
feat(api):        → Hono API / route changes
feat(db):         → schema, migrations, DAL
feat(auth):       → authentication / permissions
feat(email):      → React Email templates
feat(publisher):  → publisher flows
feat(comic):      → title / chapter / page logic
feat(wave):       → wave / drop management
feat(admin):      → admin / developer dashboard
feat(upload):     → S3 / file upload flows
chore(deps):      → dependency updates
chore(env):       → environment variable changes
```

### Examples

Single change:

```
fix(api): handle null session on sign-out
```

Multiple changes (use bullet body):

```
refactor(auth): remove better-auth from web, add Hono session API

- Rename apps/web package from "coco-kit" to "@coco-kit/web"
- Remove better-auth dep from apps/web and @coco-kit/zod
- Replace authClient with React Query useSession hook (GET /auth/session)
- Add GET /auth/session and POST /auth/sign-out to apps/api
- Migrate auth-logout and avatar-upload off authClient to Hono client
```

### Rules

1. Subject line **under 50 chars**, no period at end
2. Use **imperative mood** → `add`, `fix`, `update` not `added`, `fixed`
3. Blank line between subject and body
4. Body is **bullet points**, not prose — one change per bullet, starts with a verb
5. Subject should name the **core** change; bullets cover the rest
6. Reference issues with `Closes #N` or `See #N`
7. Never commit `.env` files, secrets, or build artifacts
8. Each commit must leave the codebase in a **working state**
9. Do **not** add `Co-Authored-By` trailers unless the user explicitly asks

---
