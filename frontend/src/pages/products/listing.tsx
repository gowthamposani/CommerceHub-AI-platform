import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Heart, Search, ShoppingCart, Filter } from 'lucide-react';

import { addCartItem } from '../../api/cart';
import { addWishlistItem } from '../../api/wishlist';
import { listProducts } from '../../api/catalog';
import { getApiErrorMessage } from '../../api/error';
import { Button, Card, EmptyState, Field, Input, LoadingScreen, Select, Alert } from '../../components/ui';
import { ProductCard } from '../../components/product-card';
import type { Product } from '../../types/domain';
import { ButtonLink, SectionHeader } from '../../components/ui';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'stock-desc';

export function ProductListingPage(): React.ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await listProducts();
        if (cancelled) {
          return;
        }
        setProducts(result.items);
        setSource(result.source);
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setError(getApiErrorMessage(requestError, 'Unable to load products right now.'));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    let nextProducts = products.filter((product) => {
      if (!query) {
        return true;
      }

      return [product.title, product.description, product.category_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    switch (sortBy) {
      case 'price-asc':
        nextProducts = [...nextProducts].sort((left, right) => left.price - right.price);
        break;
      case 'price-desc':
        nextProducts = [...nextProducts].sort((left, right) => right.price - left.price);
        break;
      case 'stock-desc':
        nextProducts = [...nextProducts].sort((left, right) => right.stock - left.stock);
        break;
      case 'featured':
      default:
        nextProducts = [...nextProducts].sort((left, right) => left.title.localeCompare(right.title));
    }

    return nextProducts;
  }, [products, search, sortBy]);

  const handleAddToCart = async (product: Product): Promise<void> => {
    setBusyProductId(product.id);
    setMessage(null);
    setError(null);

    try {
      await addCartItem({ product_id: product.id, quantity: 1 });
      setMessage(`${product.title} added to cart.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not add this product to the cart.'));
    } finally {
      setBusyProductId(null);
    }
  };

  const handleAddToWishlist = async (product: Product): Promise<void> => {
    setBusyProductId(product.id);
    setMessage(null);
    setError(null);

    try {
      await addWishlistItem({ product_id: product.id });
      setMessage(`${product.title} added to your wishlist.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not add this product to the wishlist.'));
    } finally {
      setBusyProductId(null);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading products" description="Fetching the latest catalog items for your shopping session." />;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Product listing"
        title="Browse the customer catalog"
        description="Search, compare, and add products directly from the enterprise storefront."
        action={
          <ButtonLink to="/cart" variant="secondary">
            View cart
          </ButtonLink>
        }
      />

      {message ? <Alert tone="success" title="Action complete">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Product action failed">{error}</Alert> : null}

      {source === 'demo' ? (
        <Alert tone="info" title="Preview catalog">
          The demo product set is active, which keeps the page populated until the live product module is available.
        </Alert>
      ) : null}

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.6fr] lg:items-end">
          <Field label="Search products" htmlFor="product-search" hint="Search by title, description, or category.">
            <Input
              id="product-search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>

          <Field label="Sort by" htmlFor="product-sort">
            <Select id="product-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="stock-desc">Stock: highest first</option>
            </Select>
          </Field>

          <div className="flex items-center gap-3">
            <Card className="flex flex-1 items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Products</p>
                <p className="mt-1 text-sm font-semibold text-brand-text">{filteredProducts.length}</p>
              </div>
              <Filter className="h-5 w-5 text-brand-primaryDark" />
            </Card>
          </div>
        </div>
      </Card>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="No products matched your search"
          description="Try another search term or clear the filters to review the full catalog."
          action={<Button onClick={() => setSearch('')}>Clear search</Button>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              href={`/products/${product.id}`}
              sourceLabel={source === 'demo' ? 'Preview' : 'Live'}
              actions={
                <>
                  <ButtonLink to={`/products/${product.id}`} variant="secondary">
                    View
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <Button
                    variant="secondary"
                    disabled={busyProductId === product.id || product.stock <= 0}
                    onClick={() => void handleAddToWishlist(product)}
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Button>
                  <Button
                    disabled={busyProductId === product.id || product.stock <= 0}
                    onClick={() => void handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
