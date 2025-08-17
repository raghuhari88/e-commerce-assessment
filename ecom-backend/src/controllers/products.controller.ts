import type { Request, Response } from 'express';
import { queryProductsWithFacets } from '../services/products.service.js';

export async function getProducts(req: Request, res: Response) {
  const {
    q,
    categories,
    brands,
    minPrice,
    maxPrice,
    sort_by = 'relevance',
    sort_order = 'desc',
    page = '1',
    pageSize = '20',
    attrs
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSz = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));

  const filters = {
    q: q?.trim() || undefined,
    categories: categories ? categories.split(',').map((s) => s.trim()) : [],
    brands: brands ? brands.split(',').map((s) => s.trim()) : [],
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    attrs: attrs
      ? Object.fromEntries(
          attrs.split(',').map((kv) => {
            const [k, v] = kv.split(':');
            return [k.trim(), v.trim()];
          })
        )
      : {},
    sort_by: sort_by as any,
    sort_order: sort_order as any,
    page: pageNum,
    pageSize: pageSz,
  };
  console.log("=========filters", filters)
  const result = await queryProductsWithFacets(filters);
  res.json(result);
}