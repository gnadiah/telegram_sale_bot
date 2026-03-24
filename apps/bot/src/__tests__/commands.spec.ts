import { describe, expect, it } from "vitest";
import { DEFAULT_BOT_COMMANDS } from "../commands";

describe("bot commands", () => {
  it("registers slash commands that Telegram can recommend from the command menu", () => {
    expect(DEFAULT_BOT_COMMANDS).toEqual([
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
    ]);
  });
});
