import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable required extensions
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS unaccent`);
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`); // Needed for gen_random_uuid() in some setups

  // Brands table
  await knex.schema.createTable('brands', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable().unique();
    t.timestamps(true, true);
  });

  // Categories table
  await knex.schema.createTable('categories', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable().unique();
    t.timestamps(true, true);
  });

  // Products table
  await knex.schema.createTable('products', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.text('description').notNullable();
    t.decimal('price', 12, 2).notNullable();
    t.string('image_url');
    t.uuid('brand_id').references('id').inTable('brands').onDelete('SET NULL');
    t.jsonb('attributes').notNullable().defaultTo('{}');
    t.integer('stock_level').defaultTo(0);
    t.decimal('avg_rating', 3, 2).defaultTo(0);
    t.specificType('product_search', 'tsvector');
    t.timestamps(true, true);
  });

  // Product-Categories join table
  await knex.schema.createTable('product_categories', (t) => {
    t.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.uuid('category_id').references('id').inTable('categories').onDelete('CASCADE');
    t.primary(['product_id', 'category_id']);
  });

  // Orders table
  await knex.schema.createTable('orders', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('stripe_session_id').unique();
    t.string('status').notNullable().defaultTo('pending');
    t.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    t.string('currency').notNullable().defaultTo('usd');
    t.string('customer_email');
    t.timestamps(true, true);
  });

  // Order items table
  await knex.schema.createTable('order_items', (t) => {
    t.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    t.uuid('product_id').references('id').inTable('products').onDelete('SET NULL');
    t.integer('quantity').notNullable();
    t.decimal('unit_price', 12, 2).notNullable();
    t.primary(['order_id', 'product_id']);
  });

  // Indexes & Full-text search trigger
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
    CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand_id);
    CREATE INDEX IF NOT EXISTS products_attributes_gin ON products USING GIN (attributes);
    CREATE INDEX IF NOT EXISTS products_product_search_idx ON products USING GIN (product_search);

    CREATE FUNCTION products_tsvector_trigger() RETURNS trigger AS $$
    BEGIN
      NEW.product_search :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER tsvectorupdate
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE PROCEDURE products_tsvector_trigger();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TRIGGER IF EXISTS tsvectorupdate ON products`);
  await knex.raw(`DROP FUNCTION IF EXISTS products_tsvector_trigger`);
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('product_categories');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('brands');
}