# Admin Auth Token Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng admin auth từ cookie chứa user id lên mô hình `access token + refresh token` có multi-session, role cơ bản, logout current/all, và quản lý nhiều tài khoản admin.

**Architecture:** Trước khi nâng auth, backend sẽ được chuyển từ runtime `ensureSchema()` sang Drizzle code-first migrations với `drizzle-kit generate` + `drizzle-kit migrate` làm flow chính, dùng schema TypeScript làm source of truth. Migration execution là trách nhiệm của operator/CLI flow, không phải runtime app startup. Runtime app chỉ connect DB và giả định schema đã được migrate sẵn. Test bootstrap dùng generated Drizzle migrations qua Drizzle migrator tương ứng với driver test, không tự dựng schema bằng raw SQL. Sau đó API phát hành JWT access token 15 phút trong response body và refresh token opaque 30 ngày trong `httpOnly` cookie. Refresh token được lưu DB dưới dạng hash, rotate mỗi lần refresh, và guard admin routes bằng bearer token + check DB để enforce `isActive` và `role`.

**Current State Note:** Codebase hiện tại chưa có schema-based auto-migration theo Drizzle. Runtime vẫn bootstrap schema bằng `ensureSchema()` và raw SQL, nên Task 1 là bước chặn bắt buộc trước mọi thay đổi auth schema mới.

**Tech Stack:** Ts.ED, Drizzle ORM, PostgreSQL/PGlite, `jose` for JWT signing/verification, Next.js App Router, Vitest, Supertest, React Testing Library

---

### Task 1: Chuyển DB schema management sang Drizzle migrations

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/drizzle.config.ts`
- Modify: `apps/api/src/config/db.ts`
- Create: `apps/api/drizzle/` (generated migrations folder, gồm SQL + meta snapshots)
- Create: `apps/api/src/db/test-schema-bootstrap.ts`
- Create: `apps/api/test/integration/db-migrations.spec.ts`
- Delete: `apps/api/src/db/migrations/` (sau khi baseline migration đã được generate và commit trong `apps/api/drizzle/`)
- Modify: `README.md`

- [ ] **Step 1: Viết test fail cho fresh DB bootstrap theo flow mới**

```ts
it("applies generated Drizzle migrations to a fresh PGlite test database", async () => {
  const db = await bootstrapTestSchema();
  const result = await db.execute(sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_name = 'admin_users'
  `);
  expect(result.rows).toHaveLength(1);
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/db-migrations.spec.ts`
Expected: FAIL sau khi bỏ `ensureSchema()` khỏi runtime vì chưa có migration/test bootstrap thay thế

- [ ] **Step 3: Implement migration foundation**

- Thêm `drizzle-kit` vào `apps/api` làm dev dependency
- Thêm scripts vào `apps/api/package.json`:
  - `db:generate`
  - `db:migrate`
  - `db:push:dev`
  - `db:check`
  - `db:studio`
- Chuyển `drizzle.config.ts` sang dùng folder output `./drizzle`
- Tạo baseline migration từ schema hiện tại bằng `drizzle-kit generate`
- Loại bỏ `ensureSchema()` khỏi runtime app path trong `db.ts`
- Runtime app path không được auto-run `db:migrate`; migrate là explicit step chạy trước `dev`, `start`, hoặc deploy
- Giữ `schema TS` là source of truth duy nhất
- Production/dev flow:
  - dùng `drizzle-kit generate` để sinh migration reviewable
  - dùng `drizzle-kit migrate` để apply migration và ghi log vào `__drizzle_migrations`
- Local rapid prototyping:
  - chỉ cho phép `drizzle-kit push` như lựa chọn dev-only
  - không dùng `push` làm migration strategy chính
- Test strategy:
  - tạo helper `test-schema-bootstrap.ts`
  - helper này chỉ phục vụ `PGlite` test database
  - helper phải apply `generated Drizzle migrations` cho test-only ephemeral DB, tách biệt hoàn toàn khỏi runtime production path
  - dùng explicit migrator `migrate` từ `drizzle-orm/pglite/migrator` cho `PGlite`
  - nếu sau này có integration path chạy test với `node-postgres`, dùng `migrate` từ `drizzle-orm/node-postgres/migrator`
  - helper test sẽ gọi trực tiếp `migrate(db, { migrationsFolder: "./drizzle" })`
  - test spec `db-migrations.spec.ts` phải import helper `bootstrapTestSchema()` từ `apps/api/src/db/test-schema-bootstrap.ts`, không gọi `initializeDatabase()` hay `getDb()` từ runtime `db.ts`
  - helper này dùng chính Drizzle migration artifacts trong `apps/api/drizzle/`, không tự dựng schema bằng raw `create table if not exists`
  - helper test không được trở thành source of truth thứ hai cho schema production; mọi thay đổi schema vẫn phải đi qua schema TS + generated Drizzle migrations
  - test bootstrap phải verify ít nhất:
    - bảng `admin_users` tồn tại sau migrate
    - bảng `__drizzle_migrations` tồn tại sau migrate
    - migration chạy idempotent trên fresh ephemeral DB trong từng test session

- [ ] **Step 4: Add migration adoption path cho database đã tồn tại**

- Tạo baseline migration đại diện cho schema hiện tại trước khi thêm auth mới
- Với DB mới: chạy `db:migrate`
- Với DB đã tồn tại và đã được bootstrap bởi `ensureSchema()`:
  - dùng one-time operator adoption flow của Drizzle để đưa DB vào trạng thái migration-managed
  - adoption flow phải được chốt theo version `drizzle-kit` đang cài trước khi chạm DB thật; không suy đoán từ docs cũ
  - runbook bắt buộc:
    - snapshot schema và dữ liệu hiện tại của production
    - restore snapshot đó sang một DB staging cô lập
    - trên staging, chạy introspection init flow tương ứng với version `drizzle-kit` đang dùng để tạo baseline migration metadata
    - generate baseline artifacts từ schema staging và commit chúng vào `apps/api/drizzle/`
    - đối chiếu baseline artifacts với schema TypeScript hiện tại
    - nếu lệch, ưu tiên sửa schema TS hoặc regenerate baseline cho đến khi `schema TS` và baseline artifacts khớp nhau hoàn toàn
    - chạy `pnpm --filter @telegram-sale-bot/api db:check`
    - chạy `pnpm --filter @telegram-sale-bot/api db:migrate` trên một DB clone mới từ cùng snapshot staging
    - xác nhận app boot và test suite pass trên DB clone đã được migrate
    - chỉ sau khi staging pass toàn bộ mới được áp dụng runbook tương tự lên DB thật
  - ghi rõ flow này trong README/operator notes
  - không tiếp tục dựa vào `create table if not exists` trong runtime nữa
  - sau bước adoption, mọi thay đổi schema tiếp theo chỉ đi qua `schema TS -> drizzle-kit generate -> drizzle-kit migrate`
  - flow này chỉ chạy một lần bởi operator, không phải một phần của runtime app hay dev boot bình thường

- [ ] **Step 5: Chạy verification cho migration foundation**

Run:
```bash
pnpm --filter @telegram-sale-bot/api db:check
pnpm --filter @telegram-sale-bot/api typecheck
pnpm --filter @telegram-sale-bot/api test
```
Expected:
- tests pass mà không cần runtime `ensureSchema()` cho app path
- migration control plane mới là Drizzle, không còn bootstrap SQL app-wide
- `apps/api/package.json` có scripts migration rõ ràng và `apps/api/drizzle/` là migration artifact folder duy nhất được commit
- `apps/api/src/db/migrations/` không còn được dùng làm migration source nữa

### Task 2: Mở rộng schema auth và env

**Files:**
- Modify: `apps/api/src/db/schema/admin-users.ts`
- Create: `apps/api/src/db/schema/admin-refresh-sessions.ts`
- Modify: `apps/api/src/db/schema/index.ts`
- Modify: `apps/api/src/config/env.ts`
- Modify: `apps/api/drizzle/` (generated migration artifacts for auth schema changes)
- Modify: `apps/api/test/setup.ts`
- Test: `apps/api/src/config/env.spec.ts`

- [ ] **Step 1: Viết test fail cho env auth mới**

```ts
it("reads token auth env values", () => {
  process.env.ADMIN_ACCESS_TOKEN_SECRET = "secret";
  process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES = "15";
  process.env.ADMIN_REFRESH_TOKEN_DAYS = "30";
  process.env.ADMIN_REFRESH_COOKIE_NAME = "tsb_refresh";
  resetEnv();

  expect(getEnv().adminAuth).toEqual({
    accessTokenSecret: "secret",
    accessTokenTtlMinutes: 15,
    refreshCookieName: "tsb_refresh",
    refreshTokenDays: 30
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/api test src/config/env.spec.ts`  
Expected: FAIL vì env chưa có `adminAuth`

- [ ] **Step 3: Implement tối thiểu**

- Thêm vào `admin_users`:
  - `role`
  - `isActive`
- Tạo bảng `admin_refresh_sessions`:
  - `id`, `adminUserId`, `familyId`, `tokenHash`, `expiresAt`, `revokedAt`, `replacedBySessionId`, `createdAt`, `lastUsedAt`, `userAgent`, `ipAddress`
- Thêm migration path cho DB đã tồn tại:
  - cập nhật schema TS trước
  - chạy `db:generate` để sinh migration Drizzle mới cho auth schema changes
  - review SQL generated:
    - `ALTER TABLE admin_users ADD COLUMN ...`
    - backfill/default cho `role` và `is_active`
    - `CREATE TABLE admin_refresh_sessions ...`
- Cập nhật env để đọc:
  - `ADMIN_ACCESS_TOKEN_SECRET`
  - `ADMIN_ACCESS_TOKEN_TTL_MINUTES`
  - `ADMIN_REFRESH_TOKEN_DAYS`
  - `ADMIN_REFRESH_COOKIE_NAME`
- Set default seed admin thành `super_admin`, `isActive=true`

- [ ] **Step 4: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/api test src/config/env.spec.ts`  
Expected: PASS

### Task 3: Xây auth token service và refresh-session persistence

**Files:**
- Create: `apps/api/src/modules/auth/admin-token.service.ts`
- Modify: `apps/api/src/modules/auth/admin-auth.service.ts`
- Test: `apps/api/test/integration/admin-auth.spec.ts`

- [ ] **Step 1: Viết test fail cho login token flow**

```ts
it("returns access token and sets refresh cookie on login", async () => {
  const response = await request
    .post("/admin/auth/login")
    .send({ username: "admin", password: "secret123" });

  expect(response.status).toBe(200);
  expect(response.body.accessToken).toEqual(expect.any(String));
  expect(response.headers["set-cookie"][0]).toContain("tsb_refresh");
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-auth.spec.ts`  
Expected: FAIL vì login hiện chỉ trả user và set cookie user id

- [ ] **Step 3: Implement tối thiểu**

- Trong `admin-token.service.ts`:
  - dùng thư viện `jose`
  - tạo JWT access token với payload `sub`, `role`, `sessionId`
  - tạo refresh token random
  - hash refresh token bằng `crypto`
- Trong `admin-auth.service.ts`:
  - login validate `isActive`
  - tạo `admin_refresh_sessions`
  - lưu token hash, expiry, metadata
- Không đổi guard ở bước này

- [ ] **Step 4: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-auth.spec.ts`  
Expected: PASS cho login token issuance

### Task 4: Thay admin auth API sang login/refresh/logout/me/logout-all

**Files:**
- Modify: `apps/api/src/modules/auth/admin-auth.controller.ts`
- Modify: `apps/api/src/modules/auth/admin-auth.guard.ts`
- Modify: `apps/api/src/modules/auth/admin-auth.service.ts`
- Test: `apps/api/test/integration/admin-auth.spec.ts`

- [ ] **Step 1: Viết các test fail cho auth contract mới**

- `POST /admin/auth/refresh` rotate refresh token và trả `{ accessToken, expiresIn, user }`
- `POST /admin/auth/logout` revoke session hiện tại
- `POST /admin/auth/logout-all` revoke toàn bộ sessions của admin hiện tại
- `GET /admin/auth/me` yêu cầu `Authorization: Bearer ...`
- account inactive bị chặn ở login và refresh

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-auth.spec.ts`  
Expected: FAIL ở refresh/logout/me bearer flow

- [ ] **Step 3: Implement tối thiểu**

- `login`
  - trả `{ accessToken, expiresIn, user }`
  - set refresh cookie
- `refresh`
  - đọc refresh cookie
  - tìm session theo hash
  - rotate token
  - revoke session cũ, tạo session mới
  - trả cùng response shape với login: `{ accessToken, expiresIn, user }`
  - set refresh cookie mới
- `logout`
  - revoke current refresh session
  - clear refresh cookie
- `logout-all`
  - dùng access token để xác định admin
  - revoke toàn bộ refresh sessions chưa revoke của admin đó
- policy rõ ràng:
  - mọi admin đều được `logout-all` cho chính mình
  - chỉ `super_admin` mới được quản lý admin users khác
- `me`
  - verify bearer JWT
  - lookup DB user
  - reject nếu `isActive=false`
- đổi `requireAdminRequest` sang đọc bearer token thay vì cookie user id

- [ ] **Step 4: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-auth.spec.ts`  
Expected: PASS toàn bộ auth tests

### Task 5: Thêm role guard và quản lý nhiều admin account

**Files:**
- Create: `apps/api/src/modules/auth/admin-role.guard.ts`
- Create: `apps/api/src/modules/admin-users/admin-users.controller.ts`
- Create: `apps/api/src/modules/admin-users/admin-users.service.ts`
- Modify: `apps/api/src/server.ts`
- Test: `apps/api/test/integration/admin-users.spec.ts`

- [ ] **Step 1: Viết test fail cho admin-user APIs**

```ts
it("allows super_admin to create and list admin users", async () => {
  const token = await loginAsSuperAdmin();
  const create = await request
    .post("/admin/admin-users")
    .set("Authorization", `Bearer ${token}`)
    .send({ username: "staff1", password: "secret123", role: "admin", isActive: true });

  expect(create.status).toBe(201);
});
```

- [ ] **Step 2: Viết test fail cho role restrictions**

```ts
it("blocks normal admin from admin-user management", async () => {
  const token = await loginAsNormalAdmin();
  await request
    .get("/admin/admin-users")
    .set("Authorization", `Bearer ${token}`)
    .expect(403);
});
```

- [ ] **Step 3: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-users.spec.ts`  
Expected: FAIL vì route chưa tồn tại

- [ ] **Step 4: Implement tối thiểu**

- `GET /admin/admin-users`
- `POST /admin/admin-users`
- `PATCH /admin/admin-users/:id`
- chỉ `super_admin` được gọi
- patch cho phép:
  - `role`
  - `isActive`
  - `password`
- nếu disable account:
  - login mới bị chặn
  - bearer requests bị chặn qua DB check
  - refresh bị chặn

- [ ] **Step 5: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-users.spec.ts`  
Expected: PASS

### Task 6: Bổ sung replay protection và multi-session behavior

**Files:**
- Modify: `apps/api/src/modules/auth/admin-auth.service.ts`
- Modify: `apps/api/src/modules/auth/admin-token.service.ts`
- Test: `apps/api/test/integration/admin-refresh-rotation.spec.ts`

- [ ] **Step 1: Viết test fail cho refresh token rotation**

```ts
it("revokes token family when an already-rotated refresh token is reused", async () => {
  const first = await loginAndCaptureRefreshCookie();
  const second = await refreshWithCookie(first.cookie);
  const replay = await refreshWithCookie(first.cookie);

  expect(replay.status).toBe(401);

  const latest = await refreshWithCookie(second.cookie);
  expect(latest.status).toBe(401);
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-refresh-rotation.spec.ts`  
Expected: FAIL vì chưa có family revoke logic

- [ ] **Step 3: Implement tối thiểu**

- session mới giữ liên kết `familyId` và `replacedBySessionId`
- nếu token cũ đã rotate mà bị dùng lại:
  - revoke session đó
  - revoke toàn bộ sessions cùng `familyId`
- cập nhật `lastUsedAt` khi refresh hợp lệ

- [ ] **Step 4: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/api test test/integration/admin-refresh-rotation.spec.ts`  
Expected: PASS

### Task 7: Refactor admin web sang bearer auth + refresh flow

**Files:**
- Modify: `apps/admin/src/lib/api.ts`
- Create: `apps/admin/src/lib/auth-store.ts`
- Modify: `apps/admin/src/app/login/page.tsx`
- Modify: `apps/admin/src/app/(dashboard)/layout.tsx`
- Modify: `apps/admin/src/features/auth/login-form.tsx`
- Test: `apps/admin/src/features/auth/login-form.spec.tsx`
- Test: `apps/admin/src/lib/api-auth.spec.ts`

- [ ] **Step 1: Viết test fail cho login lưu access token**

```ts
it("stores access token from login response", async () => {
  const store = createAuthStore();
  store.setAccessToken("token-1");
  expect(store.getAccessToken()).toBe("token-1");
});
```

- [ ] **Step 2: Viết test fail cho auto refresh on 401**

```ts
it("refreshes and retries protected request once when access token expires", async () => {
  // first request 401, refresh succeeds, retry succeeds
});
```

- [ ] **Step 3: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/admin test`  
Expected: FAIL vì admin client hiện dùng cookie auth trực tiếp

- [ ] **Step 4: Implement tối thiểu**

- tạo auth store in-memory cho access token
- auth store giữ thêm `currentUser`
- `loginAdmin`
  - nhận `{ accessToken, user }`
  - lưu access token
  - lưu `currentUser`
- thêm helper fetch admin API:
  - gắn `Authorization: Bearer ...`
  - nếu 401:
    - gọi `/admin/auth/refresh` với `credentials: include`
    - cập nhật access token
    - cập nhật `currentUser` trực tiếp từ response refresh
    - retry đúng 1 lần
- `layout.tsx` bootstrap:
  - nếu chưa có token, gọi refresh
  - nếu refresh fail, redirect `/login`
- bootstrap contract:
  - sau refresh thành công, UI luôn có `currentUser.id`, `currentUser.username`, `currentUser.role`
  - role này được dùng để ẩn/hiện link `Admins` và action admin-only
- `logout` clear access token memory

- [ ] **Step 5: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/admin test`  
Expected: PASS

### Task 8: Thêm UI quản lý admin users và auth actions

**Files:**
- Create: `apps/admin/src/app/(dashboard)/admins/page.tsx`
- Create: `apps/admin/src/features/admin-users/admin-user-form.tsx`
- Create: `apps/admin/src/features/admin-users/admin-user-table.tsx`
- Modify: `apps/admin/src/app/(dashboard)/layout.tsx`
- Modify: `apps/admin/src/lib/api.ts`
- Test: `apps/admin/src/features/admin-users/admin-user-form.spec.tsx`
- Test: `apps/admin/src/features/admin-users/admin-user-table.spec.tsx`

- [ ] **Step 1: Viết test fail cho create/update admin UI**

- tạo admin mới
- sửa `role`
- toggle `isActive`
- hidden/disabled actions nếu không phải `super_admin`

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `pnpm --filter @telegram-sale-bot/admin test`  
Expected: FAIL vì components/page chưa tồn tại

- [ ] **Step 3: Implement tối thiểu**

- trang `/admins`
- table hiển thị:
  - `username`
  - `role`
  - `isActive`
- form create admin
- action patch admin
- button:
  - `Logout`
  - `Logout all sessions`
- nav thêm link `Admins`

- [ ] **Step 4: Chạy test lại**

Run: `pnpm --filter @telegram-sale-bot/admin test`  
Expected: PASS

### Task 9: Cập nhật docs và full verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Cập nhật env docs**

- thêm:
  - `ADMIN_ACCESS_TOKEN_SECRET`
  - `ADMIN_ACCESS_TOKEN_TTL_MINUTES`
  - `ADMIN_REFRESH_TOKEN_DAYS`
  - `ADMIN_REFRESH_COOKIE_NAME`

- [ ] **Step 2: Cập nhật README**

- auth model mới
- bearer header cho admin API
- refresh cookie flow
- admin roles
- multi-session + logout current/all

- [ ] **Step 3: Chạy verification cuối**

Run:

```bash
pnpm typecheck
pnpm test
```

Expected:
- `typecheck`: pass toàn repo
- `test`: pass toàn repo

- [ ] **Step 4: Kiểm tra regression chính**

- login admin thành công
- refresh hoạt động sau 401
- catalog/products/orders admin vẫn hoạt động
- bot flow không bị ảnh hưởng

## Assumptions and defaults

- Access token được giữ in-memory trên admin web, không lưu localStorage/sessionStorage.
- Refresh token là opaque token DB-backed và được set bằng `httpOnly cookie`.
- Drizzle schema TypeScript là source of truth cho DB structure.
- Migration flow chính là `drizzle-kit generate` + `drizzle-kit migrate`.
- `drizzle-kit push` chỉ là lựa chọn dev-only cho local prototyping nhanh, không phải production migration path.
- `super_admin` là role mặc định của tài khoản seed đầu tiên.
- `admin` không có quyền quản lý admin users.
- mọi admin có thể `logout-all` cho chính mình.
- chỉ `super_admin` mới có quyền quản lý admin users khác.
- Không làm UI quản lý từng session/device ở đợt này; chỉ có revoke current/all.
