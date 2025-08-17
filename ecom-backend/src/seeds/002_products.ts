import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import fetch from 'node-fetch'; // Make sure to install this

// Realistic images per category
const categoryImages: Record<string, string[]> = {
  Electronics: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    "https://images.unsplash.com/photo-1580894742488-5f98f53e5b57",
    "https://images.unsplash.com/photo-1518779578993-ec3579fee39f"
  ],
  Computers: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"
  ],
  Phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8",
    "https://images.unsplash.com/photo-1512499617640-c2f999018b72"
  ],
  Audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a",
    "https://images.unsplash.com/photo-1512499617640-c2f999018b72"
  ],
  Apparel: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    "https://images.unsplash.com/photo-1520975918310-0d668f1f7757"
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1528701800489-20be1e3e08b5",
    "https://images.unsplash.com/photo-1539186607619-df476afe6d10",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"
  ],
  Groceries: [
    "https://images.unsplash.com/photo-1506807803488-8eafc15316c2",
    "https://images.unsplash.com/photo-1506806732259-39c2d0268443",
    "https://images.unsplash.com/photo-1586201375761-83865001e31c"
  ]
};

function getRandomImage(category: string): string {
  const imgs = categoryImages[category] || [];
  if (imgs.length === 0) return faker.image.urlPicsumPhotos({ width: 600, height: 400 });
  return faker.helpers.arrayElement(imgs);
}

function randomAttributes(forCategory: string) {
  switch (forCategory) {
    case 'Electronics':
    case 'Computers':
      return {
        'Screen Size': faker.number.int({ min: 11, max: 17 }) + ' inch',
        'RAM': faker.helpers.arrayElement(['8 GB', '16 GB', '32 GB']),
        'Storage': faker.helpers.arrayElement(['256 GB', '512 GB', '1 TB']),
        'CPU': faker.helpers.arrayElement(['i5', 'i7', 'Ryzen 5', 'Ryzen 7'])
      };
    case 'Phones':
      return {
        'Screen Size': faker.number.int({ min: 5, max: 7 }) + ' inch',
        'Storage': faker.helpers.arrayElement(['128 GB', '256 GB', '512 GB']),
        'Camera': faker.number.int({ min: 8, max: 108 }) + ' MP'
      };
    case 'Audio':
      return {
        'Type': faker.helpers.arrayElement(['Earbuds', 'Headphones', 'Speaker']),
        'Wireless': faker.helpers.arrayElement(['Yes', 'No'])
      };
    case 'Apparel':
      return {
        'Material': faker.helpers.arrayElement(['Cotton', 'Polyester', 'Wool', 'Linen']),
        'Size': faker.helpers.arrayElement(['S', 'M', 'L', 'XL'])
      };
    case 'Footwear':
      return {
        'Size (EU)': String(faker.number.int({ min: 36, max: 46 })),
        'Material': faker.helpers.arrayElement(['Leather', 'Mesh', 'Synthetic'])
      };
    case 'Groceries':
      return {
        'Weight': faker.number.int({ min: 100, max: 2000 }) + ' g',
        'Organic': faker.helpers.arrayElement(['Yes', 'No'])
      };
    default:
      return { Color: faker.color.human() };
  }
}

export async function seed(knex: Knex): Promise<void> {
  const brandRows = await knex('brands').select('*');
  const categoryRows = await knex('categories').select('*');

  const products: any[] = [];
  const productCategories: any[] = [];

  // Fetch real products from DummyJSON API
  const response = await fetch('https://dummyjson.com/products?limit=1000');
  const data:any = await response.json();
  const realProducts = data.products;

  for (const p of realProducts) {
    const brand = faker.helpers.arrayElement(brandRows);
    const catPrimary = faker.helpers.arrayElement(categoryRows);

    const name = p.title;
    const description = p.description;
    const price = p.price;
    const image_url = p.thumbnail || getRandomImage(catPrimary.name);
    const attrs = randomAttributes(catPrimary.name);
    const stock_level = faker.number.int({ min: 0, max: 100 });
    const avg_rating = Number((Math.random() * 5).toFixed(2));

    products.push({
      name,
      description,
      price,
      image_url,
      brand_id: brand.id,
      attributes: attrs,
      stock_level,
      avg_rating
    });
  }

  // Insert products and get their IDs
  const inserted = await knex('products').insert(products).returning(['id']);

  // Link products to categories (1 or 2 categories per product)
  inserted.forEach((row) => {
    const c1 = faker.helpers.arrayElement(categoryRows).id;
    const c2 = faker.helpers.arrayElement(categoryRows).id;
    productCategories.push({ product_id: row.id, category_id: c1 });
    if (c2 !== c1) productCategories.push({ product_id: row.id, category_id: c2 });
  });

  await knex('product_categories').insert(productCategories);
}
