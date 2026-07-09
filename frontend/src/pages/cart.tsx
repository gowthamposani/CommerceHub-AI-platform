import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';

import { clearCart, deleteCartItem, getCart, updateCartQuantity } from '../api/cart';
import { getApiErrorMessage } from '../api/error';
import { Button, ButtonLink, Card, EmptyState, LoadingScreen, SectionHeader, Alert, Badge } from '../components/ui';
import { formatCurrency, shortId } from '../utils/format';
import type { Cart, CartItem } from '../types/domain';

export function CartPage(): React.ReactElement {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setCart(await getCart());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load your cart right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const handleQuantityChange = async (item: CartItem, quantity: number): Promise<void> => {
    if (quantity < 1) {
      return;
    }

    setBusyItemId(item.id);
    setMessage(null);
    setError(null);

    try {
      const nextCart = await updateCartQuantity(item.id, { quantity });
      setCart(nextCart);
      setMessage('Cart quantity updated.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not update this cart item.'));
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string): Promise<void> => {
    setBusyItemId(itemId);
    setMessage(null);
    setError(null);

    try {
      const nextCart = await deleteCartItem(itemId);
      setCart(nextCart);
      setMessage('Cart item removed.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not remove this item from the cart.'));
    } finally {
      setBusyItemId(null);
    }
  };

  const handleClearCart = async (): Promise<void> => {
    setBusyItemId('clear');
    setMessage(null);
    setError(null);

    try {
      const nextCart = await clearCart();
      setCart(nextCart);
      setMessage('Cart cleared.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not clear the cart.'));
    } finally {
      setBusyItemId(null);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading cart" description="Fetching your saved items and totals." />;
  }

  const items = cart?.items ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Shopping cart"
        title="Review your items before checkout"
        description="Adjust quantities, remove items you no longer want, and proceed when the basket looks right."
        action={
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/products" variant="secondary">
              Keep shopping
            </ButtonLink>
            <ButtonLink to="/checkout">Checkout</ButtonLink>
          </div>
        }
      />

      {message ? <Alert tone="success" title="Cart updated">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Cart error">{error}</Alert> : null}

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title="Your cart is empty"
          description="Add products from the catalog or move saved items from your wishlist into the cart."
          action={<ButtonLink to="/products">Browse products</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="space-y-4 p-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl border border-brand-border/80 bg-brand-secondary/30 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-brand-text">
                      {item.product_title ?? `Cart item ${shortId(item.product_id)}`}
                    </h3>
                    <Badge tone="neutral">x{item.quantity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-brand-muted">Product ID: {shortId(item.product_id, 12)}</p>
                  <p className="mt-2 text-sm font-medium text-brand-text">
                    Unit price {formatCurrency(item.unit_price)} · Line total {formatCurrency(item.line_total)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-10 w-10 p-0"
                    disabled={busyItemId === item.id || item.quantity <= 1}
                    onClick={() => void handleQuantityChange(item, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[3rem] rounded-2xl border border-brand-border bg-white px-4 py-2 text-center text-sm font-semibold">
                    {item.quantity}
                  </div>
                  <Button
                    variant="secondary"
                    className="h-10 w-10 p-0"
                    disabled={busyItemId === item.id}
                    onClick={() => void handleQuantityChange(item, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    className="ml-2"
                    disabled={busyItemId === item.id}
                    onClick={() => void handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </Card>

          <Card className="h-fit p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Summary</p>
                <h2 className="mt-2 text-2xl font-semibold text-brand-text">Order total</h2>
              </div>

              <div className="space-y-3 rounded-3xl bg-brand-secondary/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Items</span>
                  <span className="font-semibold text-brand-text">{cart?.item_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Quantity</span>
                  <span className="font-semibold text-brand-text">{cart?.total_quantity ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Subtotal</span>
                  <span className="font-semibold text-brand-text">{formatCurrency(cart?.subtotal ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-brand-border pt-3 text-base">
                  <span className="font-semibold text-brand-text">Grand total</span>
                  <span className="text-xl font-semibold text-brand-primaryDark">
                    {formatCurrency(cart?.grand_total ?? 0)}
                  </span>
                </div>
              </div>

              <ButtonLink to="/checkout" fullWidth>
                Proceed to checkout
              </ButtonLink>
              <Button variant="secondary" fullWidth disabled={busyItemId === 'clear'} onClick={() => void handleClearCart()}>
                <X className="h-4 w-4" />
                Clear cart
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
