import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
} from 'lucide-react';

import { listProducts } from '../api/catalog';
import { ButtonLink, Card, SectionBadge, SectionHeader } from '../components/ui';
import { ProductCard } from '../components/product-card';
import type { Product } from '../types/domain';
import { getApiErrorMessage } from '../api/error';
import { Alert, LoadingScreen, EmptyState } from '../components/ui';

export function LandingPage(): React.ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
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
        setProducts(result.items.slice(0, 3));
        setSource(result.source);
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setError(getApiErrorMessage(requestError, 'Unable to load featured products'));
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

  return (
    <div className="space-y-12 pb-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <SectionBadge>Premium customer portal</SectionBadge>
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold leading-tight text-brand-text sm:text-5xl lg:text-6xl">
              Shop with a calm, modern experience that feels effortless from first browse to checkout.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-brand-muted sm:text-lg">
              CommerceHub AI brings together products, wishlist, cart, checkout, orders, and profile
              management into a polished customer workspace built on secure JWT sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink to="/register">
              Get started
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/login" variant="secondary">
              Sign in
            </ButtonLink>
            <Link to="/products" className="text-sm font-semibold text-brand-primaryDark underline-offset-4 hover:underline">
              Explore products
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Secure JWT access', icon: ShieldCheck },
              { label: 'Wishlist and cart', icon: Heart },
              { label: 'Tracked orders', icon: PackageSearch },
            ].map((item) => (
              <Card key={item.label} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-secondary p-3 text-brand-primaryDark">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium leading-6 text-brand-text">{item.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-soft">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-text">Curated customer portal</p>
                <p className="text-xs text-brand-muted">Built for daily shopping flows</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Orders placed today', value: '24' },
                { label: 'Saved addresses', value: '6' },
                { label: 'Wishlisted products', value: '18' },
                { label: 'Checkout completion', value: '92%' },
              ].map((item) => (
                <Card key={item.label} className="border-brand-border/80 bg-white/85 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-brand-text">{item.value}</p>
                </Card>
              ))}
            </div>

            <Alert tone="info" title="Customer-first design">
              Rounded surfaces, soft shadows, and gold accents keep the experience premium and easy to scan.
            </Alert>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Platform highlights"
          title="Everything a customer needs in one place"
          description="The portal keeps browsing, saving, purchasing, and account management connected to the same authenticated session."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: ShoppingCart,
              title: 'Cart management',
              text: 'Add products, adjust quantities, and review totals before checkout.',
            },
            {
              icon: Heart,
              title: 'Wishlist saving',
              text: 'Keep products ready for later and move them into the cart when you are ready.',
            },
            {
              icon: Truck,
              title: 'Order tracking',
              text: 'Review placed, confirmed, shipped, and delivered statuses from one dashboard.',
            },
            {
              icon: ShieldCheck,
              title: 'Protected profile',
              text: 'Update your name, manage addresses, and keep your account data current.',
            },
          ].map((item) => (
            <Card key={item.title} className="p-5">
              <div className="rounded-2xl bg-brand-secondary p-3 text-brand-primaryDark">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-brand-text">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Featured products"
          title="Start with a few curated picks"
          description={
            source === 'demo'
              ? 'The catalog fallback is active here, which keeps the frontend usable until the product module is fully connected.'
              : 'These are live products from the backend catalog.'
          }
        />

        {loading ? (
          <LoadingScreen title="Loading featured products" description="Pulling the latest catalog picks into the landing page." />
        ) : error ? (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" />}
            title="Featured products unavailable"
            description={error}
            action={<ButtonLink to="/products">Try the product listing</ButtonLink>}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" />}
            title="No featured products yet"
            description="Once the product module is populated, the landing page will show live catalog highlights."
            action={<ButtonLink to="/products">Browse all products</ButtonLink>}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/products/${product.id}`}
                highlight
                sourceLabel={source === 'demo' ? 'Preview' : 'Live'}
                actions={
                  <>
                    <ButtonLink to={`/products/${product.id}`} variant="secondary">
                      View details
                    </ButtonLink>
                    <ButtonLink to="/register">
                      Join to shop
                    </ButtonLink>
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
