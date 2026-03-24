import { Bot, InlineKeyboard, InputFile, session, type BotError, type Context, type SessionFlavor } from "grammy";
import type { BotProduct } from "./api/client";
import type { createApiClient } from "./api/client";
import { DEFAULT_BOT_COMMANDS } from "./commands";
import { renderCategoryMenu, renderProductMenu } from "./flows/catalog";
import { renderDeliverySuccess } from "./flows/delivery";
import { getQuantityPrompt, parseQuantityInput, renderSelectedProductMessage } from "./flows/quantity";
import { sendOrUpdateMenu } from "./menu";
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
  bot.catch(createBotErrorHandler(console));

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

  bot.command("menu", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    ctx.session.awaitingQuantity = false;
    ctx.session.selectedCategoryId = undefined;
    ctx.session.selectedProduct = undefined;
    await sendOrUpdateMenu(ctx, view.text, keyboard);
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Hướng dẫn nhanh:",
        "/start - Khởi động bot",
        "/menu - Mở danh mục sản phẩm",
        "/help - Xem trợ giúp",
        "",
        "Bạn có thể chọn danh mục, chọn sản phẩm, nhập số lượng và nhận tệp giao hàng ngay trong cuộc trò chuyện này."
      ].join("\n")
    );
  });

  bot.callbackQuery("home", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    ctx.session.awaitingQuantity = false;
    ctx.session.selectedCategoryId = undefined;
    ctx.session.selectedProduct = undefined;
    await ctx.answerCallbackQuery();
    await sendOrUpdateMenu(ctx, view.text, keyboard);
  });

  bot.callbackQuery("refresh:categories", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    await ctx.answerCallbackQuery();
    await sendOrUpdateMenu(ctx, view.text, keyboard);
  });

  bot.callbackQuery(/category:(.+)/, async (ctx) => {
    const categoryId = ctx.match[1];
    const categories = await apiClient.getCategories();
    const category = categories.find((item) => item.id === categoryId);
    const { keyboard, view } = await buildProductsView(apiClient, category?.name ?? "San pham", categoryId);

    ctx.session.awaitingQuantity = false;
    ctx.session.selectedCategoryId = categoryId;

    await ctx.answerCallbackQuery();
    await sendOrUpdateMenu(ctx, view.text, keyboard);
  });

  bot.callbackQuery("back:categories", async (ctx) => {
    const { keyboard, view } = await buildCategoriesView(apiClient);
    ctx.session.awaitingQuantity = false;
    ctx.session.selectedProduct = undefined;
    await ctx.answerCallbackQuery();
    await sendOrUpdateMenu(ctx, view.text, keyboard);
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
    await sendOrUpdateMenu(ctx, view.text, keyboard);
  });

  bot.callbackQuery("cancel:product", async (ctx) => {
    const categoryId = ctx.session.selectedCategoryId;

    ctx.session.awaitingQuantity = false;
    ctx.session.selectedProduct = undefined;

    if (!categoryId) {
      await ctx.answerCallbackQuery({ text: "Đã hủy lựa chọn." });
      const { keyboard, view } = await buildCategoriesView(apiClient);
      await sendOrUpdateMenu(ctx, view.text, keyboard);
      return;
    }

    const categories = await apiClient.getCategories();
    const category = categories.find((item) => item.id === categoryId);
    const { keyboard, view } = await buildProductsView(apiClient, category?.name ?? "Sản phẩm", categoryId);

    await ctx.answerCallbackQuery({ text: "Đã hủy lựa chọn." });
    await sendOrUpdateMenu(ctx, view.text, keyboard);
  });

  bot.callbackQuery(/product:(.+)/, async (ctx) => {
    const productId = ctx.match[1];
    const categoryId = ctx.session.selectedCategoryId;

    if (!categoryId) {
      await ctx.answerCallbackQuery();
      await ctx.reply("Vui lòng chọn danh mục sản phẩm trước.");
      return;
    }

    const products = await apiClient.getProducts(categoryId);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      await ctx.answerCallbackQuery();
      await ctx.reply("Sản phẩm này không còn khả dụng. Vui lòng làm mới danh sách và thử lại.");
      return;
    }

    const prompt = getQuantityPrompt(product.name, product.stock);

    if (!prompt.ok) {
      ctx.session.awaitingQuantity = false;
      ctx.session.selectedProduct = undefined;
      await ctx.answerCallbackQuery({ text: "Sản phẩm đã hết hàng." });
      return;
    }

    ctx.session.awaitingQuantity = true;
    ctx.session.selectedProduct = product;
    await ctx.answerCallbackQuery();

    await sendOrUpdateMenu(
      ctx,
      renderSelectedProductMessage({
        name: product.name,
        price: product.price,
        stock: product.stock
      }),
      new InlineKeyboard().text("❌ Hủy chọn", "cancel:product")
    );
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

export function createBotErrorHandler(logger: Pick<Console, "error"> = console) {
  return async (error: BotError<BotContext>) => {
    logger.error("Error in bot middleware", {
      error: error.error,
      updateId: error.ctx.update.update_id
    });

    try {
      await error.ctx.reply("⚠️ Đã xảy ra lỗi tạm thời trong quá trình xử lý yêu cầu. Vui lòng thử lại sau ít phút.");
    } catch (replyError) {
      logger.error("Failed to send fallback error message", replyError);
    }
  };
}

export async function registerBotCommands(bot: Bot<BotContext>, logger: Pick<Console, "warn"> = console) {
  try {
    await bot.api.setMyCommands(DEFAULT_BOT_COMMANDS);
  } catch (error) {
    logger.warn("Unable to register Telegram bot commands. The bot will continue to run.", error);
  }
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
