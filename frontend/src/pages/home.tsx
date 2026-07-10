import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Heart,
  PackageSearch,
  ShoppingCart,
  Sparkles,
  Truck,
  UsersRound,
} from 'lucide-react';

import { getCart } from '../api/cart';
import { listOrders } from '../api/order';
import { getCustomerProfile } from '../api/customer';
import { getWishlist } from '../api/wishlist';
import { listProducts } from '../api/catalog';
import { useAuth } from '../auth/use-auth';
import { ButtonLink, Card, EmptyState, LoadingScreen, SectionHeader, StatCard, Alert } from '../components/ui';
import { ProductCard } from '../components/product-card';
import { getApiErrorMessage } from '../api/error';
import { formatCurrency, formatDateTime } from '../utils/format';
import type { Cart, CustomerProfile, Order, Product } from '../types/domain';

export function HomePage(): React.ReactElement {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [catalogSource, setCatalogSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setMessage(null);

      const [profileResult, cartResult, wishlistResult, ordersResult, productsResult] =
        await Promise.allSettled([
          getCustomerProfile(),
          getCart(),
          getWishlist(),
          listOrders(),
          listProducts(),
        ]);

      if (cancelled) {
        return;
      }

      const errors: string[] = [];

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
      } else {
        errors.push(getApiErrorMessage(profileResult.reason, 'profile'));
      }

      if (cartResult.status === 'fulfilled') {
        setCart(cartResult.value);
      } else {
        errors.push(getApiErrorMessage(cartResult.reason, 'cart'));
      }

      if (wishlistResult.status === 'fulfilled') {
        setWishlistCount(wishlistResult.value.length);
      } else {
        errors.push(getApiErrorMessage(wishlistResult.reason, 'wishlist'));
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value);
      } else {
        errors.push(getApiErrorMessage(ordersResult.reason, 'orders'));
      }

      if (productsResult.status === 'fulfilled') {
        setFeaturedProducts(productsResult.value.items.slice(0, 3));
        setCatalogSource(productsResult.value.source);
      } else {
        errors.push(getApiErrorMessage(productsResult.reason, 'catalog'));
      }

      if (errors.length > 0) {
        setMessage('Some dashboard sections could not refresh, but your portal is still available.');
      }

      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const recentOrder = orders[0] ?? null;
  const addressesCount = profile?.addresses.length ?? 0;

  const stats = useMemo(
    () => [
      {
        label: 'Cart items',
        value: String(cart?.item_count ?? 0),
        trend: cart ? `Subtotal ${formatCurrency(cart.subtotal)}` : 'No active cart data',
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        label: 'Wishlist items',
        value: String(wishlistCount),
        trend: 'Saved for later',
        icon: <Heart className="h-5 w-5" />,
      },
      {
        label: 'Orders placed',
        value: String(orders.length),
        trend: recentOrder ? `Latest ${formatDateTime(recentOrder.created_at)}` : 'No orders yet',
        icon: <PackageSearch className="h-5 w-5" />,
      },
      {
        label: 'Saved addresses',
        value: String(addressesCount),
        trend: 'Delivery ready',
        icon: <UsersRound className="h-5 w-5" />,
      },
    ],
    [addressesCount, cart, orders, recentOrder, wishlistCount],
  );

  if (loading) {
    return <LoadingScreen title="Loading your dashboard" description="We are syncing your cart, wishlist, and recent orders." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">
            <Sparkles className="h-4 w-4 text-brand-primaryDark" />
            Customer dashboard
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-brand-text sm:text-4xl">
              Welcome back, {profile?.full_name ?? user?.full_name ?? 'Customer'}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted sm:text-base">
              Pick up where you left off, continue browsing products, and manage every part of the purchase journey from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/products">Continue shopping</ButtonLink>
            <ButtonLink to="/cart" variant="secondary">
              View cart
            </ButtonLink>
            <ButtonLink to="/orders" variant="secondary">
              Track orders
            </ButtonLink>
          </div>

          {message ? (
            <Alert tone="warning" title="Some data is still catching up">
              {message}
            </Alert>
          ) : null}
        </div>

        <Card className="overflow-hidden p-6">
          <div className="rounded-[24px] bg-[linear-gradient(160deg,rgba(201,139,43,0.16),rgba(245,242,237,0.95))] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-primaryDark">
              {user?.email}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-brand-text">
              {recentOrder ? 'Your latest order looks good.' : 'Your shopping space is ready.'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              {recentOrder
                ? `Order ${recentOrder.id.slice(0, 8)} is currently ${recentOrder.status.replace(/_/g, ' ')}.`
                : 'You have not placed an order yet. Browse products, add favorites, and check out when you are ready.'}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Subtotal</p>
              <p className="mt-2 text-xl font-semibold text-brand-text">
                {cart ? formatCurrency(cart.subtotal) : formatCurrency(0)}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Cart summary from the backend</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Addresses</p>
              <p className="mt-2 text-xl font-semibold text-brand-text">{addressesCount}</p>
              <p className="mt-1 text-xs text-brand-muted">Ready for delivery selection</p>
            </Card>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} trend={stat.trend} icon={stat.icon} />
        ))}
      </section>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Quick actions"
          title="Keep the journey moving"
          description="These shortcuts take you directly to the most common customer actions."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Browse the catalog',
              text: 'Discover available products and move them into your wishlist or cart.',
              to: '/products',
            },
            {
              title: 'Review saved items',
              text: 'Open your wishlist and move anything you are ready to purchase into the cart.',
              to: '/wishlist',
            },
            {
              title: 'Check delivery addresses',
              text: 'Make sure your default shipping address is current before checkout.',
              to: '/addresses',
            },
          ].map((action) => (
            <Card key={action.title} className="p-5">
              <h3 className="text-lg font-semibold text-brand-text">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{action.text}</p>
              <ButtonLink to={action.to} variant="secondary" className="mt-5">
                Open
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Featured products"
          title="A few products to keep in view"
          description={
            catalogSource === 'demo'
              ? 'The demo catalog is currently active, which keeps the UI populated until the product module is fully live.'
              : 'These suggestions are coming directly from the backend product catalog.'
          }
        />

        {featuredProducts.length === 0 ? (
          <EmptyState
            icon={<Truck className="h-8 w-8" />}
            title="No catalog items are visible yet"
            description="Once products are published, they will appear here as fast-access shopping prompts."
            action={<ButtonLink to="/products">Go to products</ButtonLink>}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/products/${product.id}`}
                sourceLabel={catalogSource === 'demo' ? 'Preview' : 'Live'}
                actions={
                  <>
                    <ButtonLink to={`/products/${product.id}`} variant="secondary">
                      View
                    </ButtonLink>
                    <ButtonLink to="/cart">Cart</ButtonLink>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
