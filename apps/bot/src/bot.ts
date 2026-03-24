import { Bot, InlineKeyboard, InputFile, session, type Context, type SessionFlavor } from "grammy";
import type { BotProduct } from "./api/client";
import type { createApiClient } from "./api/client";
import { renderCategoryMenu, renderProductMenu } from "./flows/catalog";
import { renderDeliverySuccess } from "./flows/delivery";
import { parseQuantityInput } from "./flows/quantity";
import { renderStartMessage } from "./flows/start";

type BotApiClient = ReturnType<typeof createApiClient>;

type BotSession = {
  awaitingQuantity: boolean;
  selectedCategoryId?: string;
  selectedProduct?: BotProduct;
};

type BotContext = Context & SessionFlavor<BotSession>;

export function createBot(apiClient: BotApiClient, token: string) {
  const bot = new Bot<BotContext>(token);

  bot.use(
    session({
      initial: (): BotSession => ({
        awaitingQuantity: false
      })
    })
  );

  bot.command("start", async (ctx) => {
    const view = renderStartMessage();
    await ctx.reply(view.text, {
      reply_markup: new InlineKeyboard().text(view.buttons[0].label, "home")
    });
  });

  bot.callbackQuery("home", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    ctx.session.awaitingQuantity = false;
    ctx.session.selectedCategoryId = undefined;
    ctx.session.selectedProduct = undefined;
    await ctx.answerCallbackQuery();
    await ctx.reply(view.text, { reply_markup: keyboard });
  });

  bot.callbackQuery("refresh:categories", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    await ctx.answerCallbackQuery();
    await ctx.reply(view.text, { reply_markup: keyboard });
  });

  bot.callbackQuery(/category:(.+)/, async (ctx) => {
    const categoryId = ctx.match[1];
    const categories = await apiClient.getCategories();
    const category = categories.find((item) => item.id === categoryId);
    const { keyboard, view } = await buildProductsView(apiClient, category?.name ?? "San pham", categoryId);

    ctx.session.awaitingQuantity = false;
    ctx.session.selectedCategoryId = categoryId;

    await ctx.answerCallbackQuery();
    await ctx.reply(view.text, { reply_markup: keyboard });
  });

  bot.callbackQuery("back:categories", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    ctx.session.awaitingQuantity = false;
    ctx.session.selectedProduct = undefined;
    await ctx.answerCallbackQuery();
    await ctx.reply(view.text, { reply_markup: keyboard });
  });

  bot.callbackQuery("refresh:products", async (ctx) => {
    const categoryId = ctx.session.selectedCategoryId;

    if (!categoryId) {
      await ctx.answerCallbackQuery();
      return;
    }

    const categories = await apiClient.getCategories();
    const category = categories.find((item) => item.id === categoryId);
    const { keyboard, view } = await buildProductsView(apiClient, category?.name ?? "San pham", categoryId);
    await ctx.answerCallbackQuery();
    await ctx.reply(view.text, { reply_markup: keyboard });
  });

  bot.callbackQuery(/product:(.+)/, async (ctx) => {
    const productId = ctx.match[1];
    const categoryId = ctx.session.selectedCategoryId;

    if (!categoryId) {
      await ctx.answerCallbackQuery();
      await ctx.reply("Hay chon danh muc truoc.");
      return;
    }

    const products = await apiClient.getProducts(categoryId);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      await ctx.answerCallbackQuery();
      await ctx.reply("San pham khong ton tai.");
      return;
    }

    ctx.session.awaitingQuantity = true;
    ctx.session.selectedProduct = product;
    await ctx.answerCallbackQuery();
    await ctx.reply(`Ban da chon ${product.name}. Nhap so luong tu 1 den ${product.stock}.`);
  });

  bot.on("message:text", async (ctx) => {
    if (!ctx.session.awaitingQuantity || !ctx.session.selectedProduct) {
      return;
    }

    const result = parseQuantityInput(ctx.message.text, ctx.session.selectedProduct.stock);

    if (!result.ok) {
      await ctx.reply(result.error);
      return;
    }

    const orderResult = await apiClient.createOrder({
      productId: ctx.session.selectedProduct.id,
      quantity: result.quantity,
      telegramUserId: String(ctx.from?.id ?? "unknown"),
      telegramUsername: ctx.from?.username
    });
    const delivery = await apiClient.getDeliveryFile(orderResult.order.id);

    ctx.session.awaitingQuantity = false;
    await ctx.replyWithDocument(new InputFile(delivery.buffer, delivery.filename));
    await ctx.reply(renderDeliverySuccess(delivery.filename));
  });

  return bot;
}

async function buildCategoriesView(apiClient: BotApiClient) {
  const categories = await apiClient.getCategories();
  const view = renderCategoryMenu(categories);
  const keyboard = new InlineKeyboard();

  view.buttons.forEach((button) => {
    keyboard.text(button.label, button.action).row();
  });

  return { keyboard, view };
}

async function buildProductsView(apiClient: BotApiClient, categoryName: string, categoryId: string) {
  const products = await apiClient.getProducts(categoryId);
  const view = renderProductMenu(categoryName, products);
  const keyboard = new InlineKeyboard();

  view.buttons.forEach((button) => {
    keyboard.text(button.label, button.action).row();
  });

  return { keyboard, view };
}
