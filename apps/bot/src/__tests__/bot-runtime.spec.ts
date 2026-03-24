import { describe, expect, it, vi } from "vitest";
import { createBotErrorHandler, registerBotCommands } from "../bot";

describe("bot runtime", () => {
  it("does not fail startup when command registration times out", async () => {
    const warn = vi.fn();
    const bot = {
      api: {
        setMyCommands: vi.fn().mockRejectedValue(new Error("ETIMEDOUT"))
      }
    } as never;

    await expect(registerBotCommands(bot, { warn } as Pick<Console, "warn">)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("logs middleware errors and sends a generic recovery message", async () => {
    const error = vi.fn();
    const ctx = {
      reply: vi.fn().mockResolvedValue(undefined),
      update: {
        update_id: 123
      }
    };

    const handleError = createBotErrorHandler({ error } as Pick<Console, "error">);

    await handleError({
      ctx,
      error: new Error("BOT_CATEGORIES_FAILED:401")
    } as never);

    expect(error).toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      "⚠️ Đã xảy ra lỗi tạm thời trong quá trình xử lý yêu cầu. Vui lòng thử lại sau ít phút."
    );
  });
});
