export type TelegramBotCommand = {
  command: string;
  description: string;
};

export const DEFAULT_BOT_COMMANDS: TelegramBotCommand[] = [
  {
    command: "start",
    description: "Khởi động bot và mở menu chính"
  },
  {
    command: "menu",
    description: "Xem danh mục sản phẩm đang mở bán"
  },
  {
    command: "help",
    description: "Xem hướng dẫn sử dụng nhanh"
  }
];
