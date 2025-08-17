import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../api/productsApi'; // Replace with your actual API
import ProductGrid from '../components/product/ProductGrid';
import '../Home.css';

const Home = () => {
  const initialFilters = {
    page: 1,
    pageSize: 10,
    q: '',
    minPrice: '',
    maxPrice: '',
    brands: [],
    categories: [],
    attrs: {},
    sort_by: 'price',
    sort_order: 'asc',
  };

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filtersForApi = {
          ...filters,
          brands: filters.brands.join(','),
          categories: filters.categories.join(','),
        };

        const data = await fetchProducts(filtersForApi);
        setProducts(data.items);
        setTotalPages(Math.ceil(data.total / filters.pageSize));
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchData();
  }, [filters]);

  const updateFilter = (type, value) => {
    setFilters(prev => {
      if (type === 'brands' || type === 'categories') {
        const current = prev[type];
        return {
          ...prev,
          [type]: current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value],
          page: 1,
        };
      } else if (type === 'attrs') {
        return {
          ...prev,
          attrs: { ...prev.attrs, ...value },
          page: 1,
        };
      } else {
        return { ...prev, [type]: value, page: 1 };
      }
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const brandOptions = [
    'Asus', "Levi's", 'H&M', 'Samsung', 'Apple', 'Lenovo', 'Puma',
    'Sony', 'HP', 'LG', 'Dell', 'Adidas', 'Nike', 'Uniqlo', 'Zara',
  ];
  const categoryOptions = [
    'Electronics', 'Footwear', 'Apparel', 'Home', 'Audio', 'Groceries',
    'Computers', 'Accessories', 'Phones',
  ];
  const colorOptions = ['red', 'green', 'blue'];

  return (
    <>
      <button className="filter-toggle" onClick={() => setIsFilterOpen(prev => !prev)}>
        {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="home-container">
        <div className={`sidebar ${isFilterOpen ? 'open' : 'closed'}`}>
          <h4>Search</h4>
          <input
            type="text"
            value={filters.q}
            onChange={e => updateFilter('q', e.target.value)}
          />

          <h4>Categories</h4>
          {categoryOptions.map(cat => (
            <label key={cat}>
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => updateFilter('categories', cat)}
              />
              {cat}
            </label>
          ))}

          <h4>Brands</h4>
          {brandOptions.map(brand => (
            <label key={brand}>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => updateFilter('brands', brand)}
              />
              {brand}
            </label>
          ))}

          <h4>Color</h4>
          {colorOptions.map(color => (
            <label key={color}>
              <input
                type="radio"
                name="color"
                checked={filters.attrs.color === color}
                onChange={() => updateFilter('attrs', { color })}
              />
              {color}
            </label>
          ))}

          <h4>Price</h4>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => updateFilter('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => updateFilter('maxPrice', e.target.value)}
          />

          <h4>Sort</h4>
          <select
            value={`${filters.sort_by}_${filters.sort_order}`}
            onChange={e => {
              const [sort_by, sort_order] = e.target.value.split('_');
              updateFilter('sort_by', sort_by);
              updateFilter('sort_order', sort_order);
            }}
          >
            <option value="price_asc">Price Low → High</option>
            <option value="price_desc">Price High → Low</option>
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
          </select>

          <button className="reset-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="main-content">
          {products.length === 0 ? (
            <div className="no-products">No product found</div>
          ) : (
            <ProductGrid products={products} />
          )}

          {products.length > 0 && (
            <div className="pagination">
              <button
                onClick={() =>
                  setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
                }
                disabled={filters.page === 1}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                    className={filters.page === pageNum ? 'active' : ''}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    page: Math.min(prev.page + 1, totalPages),
                  }))
                }
                disabled={filters.page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
