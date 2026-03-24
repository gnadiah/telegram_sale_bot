# Telegram Sale Bot

Monorepo cho hệ thống bán hàng số qua Telegram, gồm 3 service:

- `apps/api`: backend `Ts.ED + Drizzle`
- `apps/bot`: Telegram bot `grammY`
- `apps/admin`: web admin `Next.js`

`API` là trung tâm của hệ thống. `bot` và `admin` chỉ gọi HTTP API, không truy cập database trực tiếp.

## Hệ thống hiện làm được gì

Luồng chính:

1. Admin đăng nhập vào admin web.
2. Admin tạo `category` và `product`.
3. Admin sửa `category` hoặc `product` bằng `PATCH`.
4. Admin nạp kho cho từng product bằng `paste text` hoặc `upload TXT`.
5. User vào bot, chọn `category -> product -> số lượng`.
6. API tạo order, trừ kho, tạo delivery file TXT.
7. Bot tải file TXT từ API và gửi lại cho user.

Ghi chú:

- Chưa có thanh toán thật.
- Hệ thống đang `assume đã thanh toán`, nên chọn số lượng xong là tạo order và giao file luôn.

## API hiện tại

Admin APIs:

- `GET /health`
- `POST /admin/auth/login`
- `POST /admin/auth/refresh`
- `POST /admin/auth/logout`
- `POST /admin/auth/logout-all`
- `GET /admin/auth/me`
- `GET /admin/admin-users`
- `POST /admin/admin-users`
- `PATCH /admin/admin-users/:id`
- `GET /admin/categories`
- `POST /admin/categories`
- `PATCH /admin/categories/:id`
- `GET /admin/products`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `POST /admin/products/:id/import-text`
- `POST /admin/products/:id/import-txt`
- `GET /admin/products/:id/stock-summary`
- `GET /admin/orders`
- `GET /admin/orders/:id`

Bot APIs:

- `GET /bot/categories`
- `GET /bot/categories/:id/products`
- `POST /bot/orders`
- `GET /bot/orders/:id/delivery-file`

## Repo structure

```text
.
├─ apps/
│  ├─ api/
│  ├─ bot/
│  └─ admin/
├─ packages/
│  └─ shared/
├─ .env.example
├─ package.json
└─ pnpm-workspace.yaml
```

## Yêu cầu môi trường

- Node.js `>= 20`
- `pnpm`
- PostgreSQL nếu chạy API với `DATABASE_DRIVER=pg`

Ghi chú:

- Test đang chạy bằng `PGlite` in-memory.
- Runtime thật của API nên dùng PostgreSQL.

## Cài đặt

```bash
pnpm install
cp .env.example .env
```

## Quick Start

Nếu bạn muốn chạy local càng nhanh càng tốt, làm theo đúng thứ tự này:

1. `pnpm install`
2. `cp .env.example .env`
3. sửa `.env` cho đúng Postgres local và token của bạn
4. `pnpm --filter @telegram-sale-bot/api db:migrate`
5. mở 3 terminal và chạy:

```bash
pnpm dev:api
pnpm dev:admin
pnpm dev:bot
```

6. kiểm tra:

- API: `http://localhost:8080/health`
- Admin: `http://localhost:3000/login`
- Bot: nhắn `/start` trên Telegram

7. flow test nhanh:

- login admin
- tạo `category`
- tạo `product`
- import stock
- mua thử bằng bot

## Biến môi trường

`.env.example` hiện đã khớp với code hiện tại:

```env
DATABASE_DRIVER=pg

DB_HOST=localhost
DB_PORT=5432
DB_NAME=telegram_sale_bot
DB_USER=postgres
DB_PASSWORD=postgres

ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret123
ADMIN_ACCESS_TOKEN_SECRET=replace-me
ADMIN_ACCESS_TOKEN_TTL_MINUTES=15
ADMIN_REFRESH_TOKEN_DAYS=30
ADMIN_REFRESH_COOKIE_NAME=tsb_refresh

BOT_API_TOKEN=replace-me
TELEGRAM_BOT_TOKEN=replace-me

API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Giải thích nhanh:

- `DATABASE_DRIVER=pg`: dùng PostgreSQL thật
- `DATABASE_DRIVER=pglite`: dùng DB in-memory
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: cấu hình kết nối PostgreSQL
- `BOT_API_TOKEN`: token nội bộ để bot gọi API
- `ADMIN_ACCESS_TOKEN_SECRET`, `ADMIN_ACCESS_TOKEN_TTL_MINUTES`, `ADMIN_REFRESH_TOKEN_DAYS`, `ADMIN_REFRESH_COOKIE_NAME`: cấu hình cho admin access/refresh token flow
- `TELEGRAM_BOT_TOKEN`: token bot lấy từ BotFather
- `API_BASE_URL`: bot gọi API qua biến này
- `NEXT_PUBLIC_API_BASE_URL`: admin web gọi API qua biến này

### Giá trị local khuyến nghị

Nếu bạn chưa có cấu hình riêng, local có thể dùng:

```env
DATABASE_DRIVER=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telegram_sale_bot
DB_USER=postgres
DB_PASSWORD=postgres

ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret123
ADMIN_ACCESS_TOKEN_SECRET=local-dev-secret
ADMIN_ACCESS_TOKEN_TTL_MINUTES=15
ADMIN_REFRESH_TOKEN_DAYS=30
ADMIN_REFRESH_COOKIE_NAME=tsb_refresh

BOT_API_TOKEN=local-bot-api-secret
TELEGRAM_BOT_TOKEN=replace-me

API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Ghi chú:

- `TELEGRAM_BOT_TOKEN` phải là token thật từ `BotFather` nếu muốn bot chạy thật.
- `BOT_API_TOKEN` chỉ cần giống nhau giữa `apps/api` và `apps/bot`.
- `ADMIN_ACCESS_TOKEN_SECRET` nên đổi sang chuỗi riêng của bạn, không để `replace-me`.

## Admin auth model

Admin web hiện dùng auth hybrid:

- `access token` JWT trả về trong response body từ `POST /admin/auth/login`
- `refresh token` opaque được lưu trong `httpOnly cookie`
- admin frontend giữ `access token` ở memory, gửi qua `Authorization: Bearer ...`
- nếu API trả `401`, admin client sẽ gọi `POST /admin/auth/refresh` rồi retry đúng 1 lần
- `POST /admin/auth/logout` revoke session hiện tại
- `POST /admin/auth/logout-all` revoke toàn bộ session của admin hiện tại

Role hiện có:

- `super_admin`: quản lý admin users, catalog, stock, orders
- `admin`: vận hành catalog, stock, orders

Ghi chú:

- `logout-all` hoạt động cho chính admin đang đăng nhập
- `admin-users` APIs chỉ cho `super_admin`

### Khi nào session admin còn hoạt động

- nếu `access token` còn hạn: request đi thẳng qua API
- nếu `access token` hết hạn nhưng `refresh cookie` còn hợp lệ: admin web tự refresh và retry
- nếu session đã bị revoke hoặc refresh cookie hết hạn: admin sẽ bị đưa về `/login`

## Database migrations

API bây giờ dùng Drizzle migrations làm control plane cho schema.

```bash
pnpm --filter @telegram-sale-bot/api db:generate
pnpm --filter @telegram-sale-bot/api db:migrate
```

Ghi chú:

- `apps/api/drizzle/` là nơi chứa migration artifacts được commit.
- `apps/api/src/config/db.ts` chỉ tạo kết nối DB, không tự dựng schema nữa.
- Runtime API không tự chạy migrate; hãy apply migration trước khi start/deploy.
- Test integration bootstrap schema bằng generated migrations trên PGlite, không đi qua runtime bootstrap.

### One-time adoption runbook

Nếu bạn đang nâng cấp một DB đã từng được tạo bằng `ensureSchema()`:

1. Chụp snapshot schema và dữ liệu hiện tại của DB thật.
2. Restore snapshot đó sang một DB staging cô lập.
3. Xác nhận chính xác version `drizzle-kit` đang cài trong workspace; adoption flow phải bám theo CLI behavior của đúng version đó, không suy diễn từ docs cũ.
4. Trên staging, chạy introspection init flow tương ứng với version `drizzle-kit` đang dùng để tạo baseline migration metadata cho schema đã tồn tại.
5. Generate baseline artifacts từ staging schema và commit chúng vào `apps/api/drizzle/`.
6. Đối chiếu baseline artifacts với schema TypeScript trong `apps/api/src/db/schema/`.
7. Nếu hai bên chưa khớp, sửa schema TS hoặc regenerate baseline cho đến khi chỉ còn một source of truth thống nhất.
8. Chạy `pnpm --filter @telegram-sale-bot/api db:check`.
9. Tạo một DB clone mới từ cùng snapshot staging, rồi chạy `pnpm --filter @telegram-sale-bot/api db:migrate` trên DB clone đó.
10. Khởi động API và chạy test suite trên DB clone đã migrate để xác nhận app boot được và schema không drift.
11. Chỉ sau khi staging clone pass toàn bộ mới áp dụng cùng runbook đó lên DB thật.

Sau khi adoption xong, mọi thay đổi schema mới phải đi qua `schema TS -> drizzle-kit generate -> drizzle-kit migrate`.

## Cách start local chi tiết

### Bước 1: Chuẩn bị PostgreSQL

Bạn cần có một database local, ví dụ:

- host: `localhost`
- port: `5432`
- database: `telegram_sale_bot`
- user: `postgres`
- password: `postgres`

Nếu Postgres local của bạn khác, sửa các biến `DB_*` trong `.env`.

### Bước 2: Apply migrations

Trước khi chạy API lần đầu, hãy apply migration:

```bash
pnpm --filter @telegram-sale-bot/api db:migrate
```

Đây là bước nên chạy lại khi:

- vừa pull code có thay đổi schema
- vừa generate migration mới
- đang chuyển sang máy/dev environment mới

### Bước 3: Start API

```bash
pnpm dev:api
```

API mặc định chạy ở `http://localhost:8080`.

Kiểm tra nhanh:

```bash
curl http://localhost:8080/health
```

Nếu API chưa lên, kiểm tra lần lượt:

- Postgres có đang chạy không
- `.env` có đúng `DB_*` không
- đã chạy `db:migrate` chưa

### Bước 4: Start admin web

```bash
pnpm dev:admin
```

Admin mặc định chạy ở `http://localhost:3000/login`.

Đăng nhập bằng:

- Username: giá trị `ADMIN_USERNAME`
- Password: giá trị `ADMIN_PASSWORD`

Sau khi login thành công:

- admin nhận `access token` từ API
- giữ token ở memory
- dùng `refresh cookie` để phục hồi session khi cần

### Bước 5: Start Telegram bot

```bash
pnpm dev:bot
```

Bot sẽ:

- kết nối Telegram bằng `TELEGRAM_BOT_TOKEN`
- gọi API bằng `API_BASE_URL`
- xác thực bot-to-api bằng `BOT_API_TOKEN`

### Bước 6: Kiểm tra end-to-end

Sau khi cả 3 service đều chạy:

1. mở admin web
2. login
3. tạo một `category`
4. tạo một `product`
5. import vài dòng stock
6. mở Telegram bot
7. gửi `/start`
8. chọn `category -> product -> quantity`
9. kiểm tra bot có trả file TXT hay không
10. quay lại admin để kiểm tra order detail

## Thứ tự nên chạy khi develop

1. PostgreSQL
2. `pnpm --filter @telegram-sale-bot/api db:migrate`
3. `pnpm dev:api`
4. `pnpm dev:admin`
5. `pnpm dev:bot`

Lý do:

- admin và bot đều phụ thuộc vào API
- API phụ thuộc vào DB schema đã migrate

## Các lệnh hay dùng

Toàn workspace:

```bash
pnpm dev:api
pnpm dev:admin
pnpm dev:bot
pnpm typecheck
pnpm test
```

API:

```bash
pnpm --filter @telegram-sale-bot/api db:generate
pnpm --filter @telegram-sale-bot/api db:migrate
pnpm --filter @telegram-sale-bot/api db:check
pnpm --filter @telegram-sale-bot/api test
```

Admin:

```bash
pnpm --filter @telegram-sale-bot/admin test
pnpm --filter @telegram-sale-bot/admin typecheck
```

Bot:

```bash
pnpm --filter @telegram-sale-bot/bot test
pnpm --filter @telegram-sale-bot/bot typecheck
```

## Cách dùng hệ thống

### Admin

Trong admin web bạn có thể:

- đăng nhập bằng access token + refresh token flow
- logout session hiện tại hoặc logout toàn bộ session của chính mình
- tạo thêm admin account
- đổi `role` hoặc `isActive` cho admin account khác nếu đang là `super_admin`
- tạo category
- sửa category: `name`, `slug`, `sortOrder`, `isActive`
- tạo product
- sửa product: `category`, `name`, `slug`, `price`, `sortOrder`, `isActive`
- import stock bằng text hoặc TXT
- xem `availableStock` ngay trên danh sách product
- xem order list và order detail

Lưu ý:

- Không có `DELETE` ở MVP này.
- Nếu muốn ẩn khỏi bot, chỉ cần set `isActive=false`.

### Bot

Flow bot hiện tại:

1. User gửi `/start`
2. Bot hiển thị category
3. User chọn category
4. Bot hiển thị product trong category đó với `tên + giá + tồn`
5. User chọn product
6. User nhập số lượng
7. API tạo order và trừ kho
8. Bot gửi file TXT cho user

Nút điều hướng hiện có:

- `Trang chu`
- `Quay lai`
- `Lam moi`

## Cách tồn kho hoạt động

Hệ thống không lưu tồn kho như một con số duy nhất.

Thay vào đó:

- mỗi dòng import tạo ra một `inventory_item`
- item mới có trạng thái `available`
- khi bán thành công, item được chuyển sang `sold`
- item sold được gắn vào `order`

Điều này giúp:

- hiển thị tồn kho chính xác
- giao đúng số dòng user mua
- audit lại chính xác item nào đã được giao

## Test và typecheck

Chạy toàn bộ:

```bash
pnpm typecheck
pnpm test
```

Chạy riêng từng app:

```bash
pnpm --filter @telegram-sale-bot/api test
pnpm --filter @telegram-sale-bot/admin test
pnpm --filter @telegram-sale-bot/bot test
```

## Trạng thái MVP hiện tại

Đã có:

- admin auth bằng `access token + refresh token`
- multi-session admin auth với refresh rotation và replay protection
- quản lý nhiều admin account với `super_admin` / `admin`
- `PATCH` cho category và product
- import stock bằng text/TXT
- admin UI cho create + edit + stock import + order audit
- bot flow mua hàng cơ bản
- order delivery bằng TXT file

Chưa có:

- thanh toán thật
- deploy config
- CI/CD
- UX polish sâu cho admin

## Troubleshooting nhanh

### Admin login được nhưng vào dashboard bị đá ra

Kiểm tra:

- `NEXT_PUBLIC_API_BASE_URL` có trỏ đúng về API không
- API có đang chạy không
- browser có nhận được `refresh cookie` không
- `ADMIN_ACCESS_TOKEN_SECRET` có bị đổi giữa các lần restart API không

### API chạy nhưng admin hoặc bot gọi không được

Kiểm tra:

- `API_BASE_URL` trong bot
- `NEXT_PUBLIC_API_BASE_URL` trong admin
- `BOT_API_TOKEN` giữa bot và API có giống nhau không

### Bot không trả lời trên Telegram

Kiểm tra:

- `TELEGRAM_BOT_TOKEN` có đúng không
- process `pnpm dev:bot` có đang chạy không
- API có đang chạy không

### Migration lỗi

Chạy lại:

```bash
pnpm --filter @telegram-sale-bot/api db:check
pnpm --filter @telegram-sale-bot/api db:migrate
```

Nếu vẫn lỗi, kiểm tra:

- `DB_*` trong `.env`
- database đã tồn tại chưa
- user DB có quyền tạo / alter bảng không

## File nên đọc tiếp

- API server: [apps/api/src/server.ts](apps/api/src/server.ts)
- API DB config: [apps/api/src/config/db.ts](apps/api/src/config/db.ts)
- Admin API client: [apps/admin/src/lib/api.ts](apps/admin/src/lib/api.ts)
- Bot runtime: [apps/bot/src/bot.ts](apps/bot/src/bot.ts)
