CREATE TABLE "admin_users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"username" varchar(255) NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory_import_batches" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"original_filename" varchar(255),
	"product_id" text NOT NULL,
	"source_type" varchar(64) NOT NULL,
	"total_accepted" integer NOT NULL,
	"total_received" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"import_batch_id" text,
	"product_id" text NOT NULL,
	"sold_at" timestamp with time zone,
	"sold_order_id" text,
	"status" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_deliveries" (
	"delivered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"line_count" integer NOT NULL,
	"order_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"order_code" varchar(64) NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(32) NOT NULL,
	"telegram_user_id" varchar(255) NOT NULL,
	"telegram_username" varchar(255),
	"total_price_snapshot" integer NOT NULL,
	"unit_price_snapshot" integer NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"category_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "inventory_import_batches" ADD CONSTRAINT "inventory_import_batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_import_batch_id_inventory_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."inventory_import_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_deliveries" ADD CONSTRAINT "order_deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;