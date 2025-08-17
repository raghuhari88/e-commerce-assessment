import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('order_items').del();
  await knex('orders').del();
  await knex('product_categories').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('brands').del();

  const brands = ['Sony', 'Dell', 'Apple', 'Samsung', 'HP', 'Lenovo', 'Asus', 'LG', 'Nike', 'Adidas', 'Puma', 'Uniqlo', 'Zara', 'H&M', 'Levi\'s'];
  const categories = ['Electronics', 'Computers', 'Phones', 'Audio', 'Apparel', 'Footwear', 'Groceries', 'Home', 'Accessories'];

  await knex('brands').insert(brands.map((name) => ({ name })));
  await knex('categories').insert(categories.map((name) => ({ name })));
}
