import { describe, expect, it, vi } from "vitest";
import { sendOrUpdateMenu } from "../menu";

describe("menu updates", () => {
  it("edits the current callback-query message when possible", async () => {
    const ctx = {
      callbackQuery: { id: "cb_1" },
      editMessageText: vi.fn().mockResolvedValue(undefined),
      reply: vi.fn().mockResolvedValue(undefined)
    };

    await sendOrUpdateMenu(ctx as never, "Updated menu");

    expect(ctx.editMessageText).toHaveBeenCalledWith("Updated menu", { reply_markup: undefined });
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  it("falls back to sending a new message when editing fails", async () => {
    const ctx = {
      callbackQuery: { id: "cb_1" },
      editMessageText: vi.fn().mockRejectedValue(new Error("message can't be edited")),
      reply: vi.fn().mockResolvedValue(undefined)
    };

    await sendOrUpdateMenu(ctx as never, "Updated menu");

    expect(ctx.reply).toHaveBeenCalledWith("Updated menu", { reply_markup: undefined });
  });
});
