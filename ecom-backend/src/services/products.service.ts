import db from '../config/db.js';

export interface ProductFilters {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  brands: string[];
  categories: string[];
  attrs: Record<string, string>;
  sort_by: "price" | "name" | "relevance";
  sort_order: "asc" | "desc";
  page: number;
  pageSize: number;
}

export async function getProductsByIds(ids: string[]) {
  return db('products').select('*').whereIn('id', ids);
}

export async function queryProductsWithFacets(filters: ProductFilters) {
  const { page, pageSize } = filters;

  const whereClauses: string[] = [];
  const bindings: any[] = [];

  // Search term
  if (filters.q) {
    whereClauses.push(`p.product_search @@ plainto_tsquery('english', ?)`);
    bindings.push(filters.q);
  }

  // Price filters
  if (filters.minPrice !== undefined) {
    whereClauses.push("p.price >= ?");
    bindings.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    whereClauses.push("p.price <= ?");
    bindings.push(filters.maxPrice);
  }

  // Brand filter
  if (filters.brands?.length) {
    whereClauses.push("b.name = ANY(?)");
    bindings.push(filters.brands);
  }

  // Category filter
  if (filters.categories?.length) {
    whereClauses.push("c.name = ANY(?)");
    bindings.push(filters.categories);
  }

  // Attribute filters
  for (const [k, v] of Object.entries(filters.attrs || {})) {
    whereClauses.push(`p.attributes ->> ? = ?`);
    bindings.push(k, v);
  }

  const whereSQL =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Sorting
  let sortColumn = "f.id"; // default
  if (filters.sort_by === "price") sortColumn = "f.price";
  else if (filters.sort_by === "name") sortColumn = "f.name";
  else if (filters.sort_by === "relevance" && filters.q) {
    sortColumn = `ts_rank(f.product_search, plainto_tsquery('english', ?))`;
  }

  const sortOrder =
    filters.sort_order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const offset = (page - 1) * pageSize;

  const sql = `
    WITH filtered AS (
      SELECT DISTINCT p.*
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      ${whereSQL}
    ),
    counts AS (
      SELECT COUNT(*)::int AS total FROM filtered
    ),
    brand_facets AS (
      SELECT b.name AS value, COUNT(*)::int AS count
      FROM filtered f
      JOIN brands b ON b.id = f.brand_id
      GROUP BY b.name
      ORDER BY count DESC, value ASC
    ),
    category_facets AS (
      SELECT c.name AS value, COUNT(*)::int AS count
      FROM filtered f
      JOIN product_categories pc ON pc.product_id = f.id
      JOIN categories c ON c.id = pc.category_id
      GROUP BY c.name
      ORDER BY count DESC, value ASC
    ),
    attribute_facets AS (
      SELECT key AS attr_key, value AS attr_value, COUNT(*)::int AS count
      FROM (
        SELECT (jsonb_each_text(attributes)).key, (jsonb_each_text(attributes)).value
        FROM filtered
      ) kv(key, value)
      GROUP BY key, value
      ORDER BY count DESC, key ASC, value ASC
    ),
    paged AS (
      SELECT f.*,
        ${
          filters.sort_by === "relevance" && filters.q
            ? `ts_rank(f.product_search, plainto_tsquery('english', ?)) AS rank`
            : "NULL AS rank"
        }
      FROM filtered f
      ORDER BY ${sortColumn} ${sortOrder} NULLS LAST, f.id ASC
      LIMIT ? OFFSET ?
    )
    SELECT json_build_object(
      'items', COALESCE((SELECT json_agg(p.*) FROM paged p), '[]'::json),
      'total', (SELECT total FROM counts),
      'facets', json_build_object(
        'brands', COALESCE((SELECT json_agg(row_to_json(t)) FROM brand_facets t), '[]'::json),
        'categories', COALESCE((SELECT json_agg(row_to_json(t)) FROM category_facets t), '[]'::json),
        'attributes', COALESCE((
          SELECT json_object_agg(attr_key, values)
          FROM (
            SELECT attr_key, json_agg(json_build_object('value', attr_value, 'count', count)) AS values
            FROM attribute_facets
            GROUP BY attr_key
          ) s
        ), '{}'::json)
      )
    ) AS data;
  `;

  const allBindings = [
    ...bindings,
    ...(filters.sort_by === "relevance" && filters.q ? [filters.q] : []),
    pageSize,
    offset,
  ];

  const result = await db.raw(sql, allBindings);
  return result.rows?.[0]?.data || {
    items: [],
    total: 0,
    facets: { brands: [], categories: [], attributes: {} },
  };
}




