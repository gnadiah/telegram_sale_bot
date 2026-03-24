import type { InlineKeyboard } from "grammy";

type MenuContext = {
  callbackQuery?: unknown;
  editMessageText: (text: string, options: { reply_markup?: InlineKeyboard }) => Promise<unknown>;
  reply: (text: string, options: { reply_markup?: InlineKeyboard }) => Promise<unknown>;
};

export async function sendOrUpdateMenu(ctx: MenuContext, text: string, replyMarkup?: InlineKeyboard) {
  if (ctx.callbackQuery) {
    try {
      await ctx.editMessageText(text, { reply_markup: replyMarkup });
      return;
    } catch {
      // Fall back to a normal message when Telegram refuses the edit.
    }
  }

  await ctx.reply(text, { reply_markup: replyMarkup });
}
