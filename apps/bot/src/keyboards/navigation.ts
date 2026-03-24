export type MenuButton = {
  action: string;
  label: string;
};

export const BACK_BUTTON: MenuButton = { action: "back", label: "⬅️ Quay lại" };
export const HOME_BUTTON: MenuButton = { action: "home", label: "🏠 Trang chủ" };
export const REFRESH_BUTTON: MenuButton = { action: "refresh", label: "🔄 Làm mới" };
