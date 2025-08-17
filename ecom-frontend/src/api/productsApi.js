import axios from 'axios';
import qs from 'qs';

const API_BASE = "http://localhost:4000/api/v1";

export const fetchProducts = async (filters) => {
  const params = {
    q: filters.q || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    brands: filters.brands.length ? filters.brands : undefined,
    categories: filters.categories.length ? filters.categories : undefined,
    attrs: Object.keys(filters.attrs).length ? JSON.stringify(filters.attrs) : undefined,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    page: filters.page,
    pageSize: filters.pageSize,
  };
  const query = qs.stringify(params, { arrayFormat: 'repeat' });
  const res = await axios.get(`${API_BASE}/products?${query}`);
  return res.data;
};


