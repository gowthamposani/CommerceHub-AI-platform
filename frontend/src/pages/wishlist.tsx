import { useEffect, useMemo, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

import { addCartItem } from '../api/cart';
import { getProduct } from '../api/catalog';
import { getApiErrorMessage } from '../api/error';
import { getWishlist, moveWishlistItemToCart, removeWishlistItem } from '../api/wishlist';
import type { Product, WishlistItem } from '../types/domain';
import { Button, ButtonLink, EmptyState, LoadingScreen, SectionHeader, Alert } from '../components/ui';
import { ProductCard } from '../components/product-card';
import { shortId } from '../utils/format';

interface WishlistEntry {
  item: WishlistItem;
  product: Product | null;
}

export function WishlistPage(): React.ReactElement {
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWishlist = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const items = await getWishlist();
      const resolved = await Promise.allSettled(items.map(async (item) => ({ item, product: (await getProduct(item.product_id)).item })));
      const nextEntries = resolved.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        return {
          item: items[index],
          product: null,
        };
      });
      setEntries(nextEntries);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load wishlist right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWishlist();
  }, []);

  const wishlistCount = useMemo(() => entries.length, [entries]);

  const handleRemove = async (productId: string): Promise<void> => {
    setBusyProductId(productId);
    setMessage(null);
    setError(null);

    try {
      await removeWishlistItem(productId);
      await loadWishlist();
      setMessage('Wishlist item removed.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not remove this wishlist item.'));
    } finally {
      setBusyProductId(null);
    }
  };

  const handleMoveToCart = async (product: Product | null, productId: string): Promise<void> => {
    setBusyProductId(productId);
    setMessage(null);
    setError(null);

    try {
      await addCartItem({ product_id: productId, quantity: 1 });
      await moveWishlistItemToCart(productId);
      await loadWishlist();
      setMessage(`${product?.title ?? `Product ${shortId(productId)}`} moved to cart.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not move this item to the cart.'));
    } finally {
      setBusyProductId(null);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading wishlist" description="Retrieving your saved products." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Wishlist"
        title="Items you saved for later"
        description="Keep products ready for purchase and move them to the cart whenever you are ready."
        action={<ButtonLink to="/products" variant="secondary">Continue shopping</ButtonLink>}
      />

      {message ? <Alert tone="success" title="Wishlist updated">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Wishlist error">{error}</Alert> : null}

      {wishlistCount === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Your wishlist is empty"
          description="Save products here so you can come back to them later."
          action={<ButtonLink to="/products">Browse products</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {entries.map(({ item, product }) => {
            const nextProduct: Product =
              product ??
              ({
                id: item.product_id,
                title: `Saved item ${shortId(item.product_id)}`,
                description: 'Product details are not available yet.',
                price: 0,
                stock: 0,
                status: 'unknown',
              } as Product);

            return (
              <ProductCard
                key={item.id}
                product={nextProduct}
                compact
                sourceLabel="Saved"
                actions={
                  <>
                    <Button
                      variant="secondary"
                      disabled={busyProductId === item.product_id}
                      onClick={() => void handleRemove(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                    <Button
                      disabled={busyProductId === item.product_id}
                      onClick={() => void handleMoveToCart(product, item.product_id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Move to cart
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
