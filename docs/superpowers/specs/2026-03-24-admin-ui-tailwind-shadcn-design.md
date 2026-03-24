# Admin UI Tailwind + shadcn/ui Design

## Summary

Nâng giao diện `apps/admin` từ HTML tối giản lên một admin dashboard sáng sạch kiểu SaaS, dùng `Tailwind CSS + shadcn/ui` làm foundation. Mục tiêu là cải thiện trải nghiệm quản trị mà không đổi flow nghiệp vụ, API contract, hay auth behavior hiện tại.

Scope của đợt này:

- setup `Tailwind CSS` cho `apps/admin`
- setup `shadcn/ui` foundation và utility chuẩn
- tạo `dashboard shell` nhất quán cho toàn admin
- restyle toàn bộ 5 khu chính:
  - `login`
  - `categories`
  - `products`
  - `orders`
  - `admins`

## Goals

- Tạo giao diện sáng sạch, dễ đọc, cảm giác giống dashboard SaaS hiện đại.
- Chuẩn hóa spacing, typography, input, button, table, card, badge.
- Giảm tối đa markup “trần”, tránh tiếp tục mở rộng admin bằng HTML + inline layout thủ công.
- Hạn chế `vanilla CSS`; chỉ dùng `globals.css` cho theme tokens, base styles, và các biến Tailwind/shadcn cần thiết.

## Non-Goals

- Không đổi logic nghiệp vụ.
- Không đổi contract API.
- Không thêm tính năng mới ngoài presentation/UI shell.
- Không làm dark mode trong đợt này.
- Không redesign bot hoặc backend.

## Design Direction

Visual direction:

- nền app: `slate/zinc` rất nhạt
- nội dung chính nằm trong `card` trắng với border mềm
- accent màu `blue/slate`
- typography rõ, thoáng, ưu tiên tính quản trị hơn trang trí
- feel tổng thể: chuyên nghiệp, hiện đại, sạch, không màu mè

Layout direction:

- `sidebar` cố định bên trái cho điều hướng chính
- `top header` mảnh ở phần content để hiển thị context hiện tại
- mỗi trang là một `page section` với:
  - tiêu đề
  - mô tả ngắn
  - khu actions
  - card/table/form bên dưới

## Technical Approach

### Styling stack

- dùng `Tailwind CSS` làm styling system chính
- dùng `shadcn/ui` làm component primitives
- dùng utility `cn()` chuẩn cho class composition
- không viết component visual bằng CSS thủ công nếu có thể giải quyết bằng Tailwind + shadcn

### Base app setup

Sẽ thêm:

- `tailwind.config` hoặc cấu hình tương ứng với Next.js hiện tại
- `postcss.config`
- `globals.css`
- `lib/utils.ts` với `cn`
- thư mục `components/ui/*` cho các primitives từ `shadcn/ui`

Component foundation dự kiến:

- `Button`
- `Input`
- `Label`
- `Textarea`
- `Card`
- `Badge`
- `Table`
- `Select`
- `Separator`
- `Skeleton` hoặc loading state tối giản nếu cần

### App shell

`apps/admin/src/app/(dashboard)/layout.tsx` sẽ được nâng cấp thành shell nhất quán:

- sidebar trái:
  - `Categories`
  - `Products`
  - `Orders`
  - `Admins` nếu `super_admin`
- header trên:
  - tên khu hiện tại
  - user identity
  - `Logout`
  - `Logout all sessions`
- content area:
  - responsive container
  - spacing nhất quán giữa page header, form, table, detail blocks

## Page-by-Page Design

### Login

- centered auth card
- title + subtitle rõ ràng
- `username` / `password` fields dùng shadcn form primitives
- submit button full width
- error message hiển thị gọn trong card

### Categories

- page header với title + mô tả
- card tạo category mới
- card/table danh sách category
- mỗi row hiển thị:
  - `name`
  - `slug`
  - `sortOrder`
  - `isActive` qua badge/switch-like control phù hợp
- edit flow giữ logic hiện tại nhưng trình bày lại bằng input/button nhất quán

### Products

- page header
- form tạo product nằm trong card riêng
- product table hiển thị:
  - `name`
  - `category`
  - `price`
  - `sortOrder`
  - `availableStock`
  - `isActive`
- khu import stock đặt thành card riêng, chọn product rõ ràng, textarea/file action rõ hơn

### Orders

- page header
- order table trong card
- cột chính:
  - order id
  - telegram username
  - quantity
  - total snapshot
  - action xem detail
- detail page dùng card sections để hiển thị order summary và delivered items

### Admins

- chỉ hiển thị đầy đủ action nếu user là `super_admin`
- form tạo admin mới trong card
- table danh sách admin với:
  - `username`
  - `role`
  - `isActive`
- patch/update controls dùng `Select`, button, badge thay vì text controls thuần

## Behavior and State

- Không đổi auth/session logic hiện tại.
- Không đổi client data fetching strategy hiện tại trong đợt này trừ khi cần thiết để gắn vào component mới.
- Loading state có thể giữ tối giản, nhưng nên tránh flash HTML trần.
- Empty state cần dễ hiểu hơn, ví dụ “No products yet” trong card/table state.

## Testing Strategy

Giữ test hiện có và cập nhật chúng theo markup/component mới khi cần.

Bổ sung hoặc điều chỉnh test ở mức:

- `login form` vẫn submit đúng
- dashboard shell render nav đúng
- `Admins` link chỉ hiện cho `super_admin`
- category/product/admin forms vẫn submit payload đúng
- table/action buttons vẫn patch/update đúng

Không cần visual snapshot testing ở đợt này.

## Risks and Mitigations

### Risk: UI refactor làm gãy test hiện có

Mitigation:

- đổi dần từng page trên foundation chung
- ưu tiên giữ semantic labels và role-based queries ổn định

### Risk: thêm Tailwind/shadcn nhưng codebase bị “nửa cũ nửa mới”

Mitigation:

- setup foundation trước
- sau đó restyle toàn bộ 5 khu chính trong cùng một đợt

### Risk: dùng quá nhiều CSS thủ công ngoài Tailwind

Mitigation:

- chỉ cho phép `globals.css` cho base layer/tokens
- component visual đi qua Tailwind + shadcn primitives

## Acceptance Criteria

- `apps/admin` có Tailwind và shadcn foundation hoạt động ổn định.
- Root layout và dashboard layout có UI shell nhất quán.
- `login`, `categories`, `products`, `orders`, `admins` đều có giao diện sáng sạch kiểu dashboard SaaS.
- Không còn các khu vực chính chỉ render bằng HTML trần không style.
- Logic nghiệp vụ và tests vẫn pass sau refactor UI.
