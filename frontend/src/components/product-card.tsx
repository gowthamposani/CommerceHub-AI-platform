import { Link } from 'react-router-dom';
import { Heart, Package, ShoppingCart, Star } from 'lucide-react';

import { Button, Card, Badge } from './ui';
import type { Product } from '../types/domain';
import { formatCurrency, truncate } from '../utils/format';
import { cn } from '../utils/cn';

export function ProductCard({
  product,
  href,
  actions,
  compact = false,
  highlight = false,
  sourceLabel,
}: {
  product: Product;
  href?: string;
  actions?: React.ReactNode;
  compact?: boolean;
  highlight?: boolean;
  sourceLabel?: string;
}): React.ReactElement {
  const title = (
    <h3 className={cn('font-semibold text-brand-text', compact ? 'text-base' : 'text-lg')}>
      {product.title}
    </h3>
  );

  return (
    <Card className={cn('overflow-hidden', highlight && 'ring-1 ring-brand-primary/20')}>
      <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,rgba(201,139,43,0.2),rgba(245,242,237,1))]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-brand-primaryDark shadow-soft">
            <Package className="h-10 w-10" />
          </div>
        </div>
        {sourceLabel ? (
          <div className="absolute left-4 top-4">
            <Badge tone="primary">{sourceLabel}</Badge>
          </div>
        ) : null}
        {product.stock <= 5 ? (
          <div className="absolute right-4 top-4">
            <Badge tone="warning">Low stock</Badge>
          </div>
        ) : null}
      </div>

      <div className={cn('space-y-4 p-5', compact && 'p-4')}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {href ? (
              <Link to={href} className="block">
                {title}
              </Link>
            ) : (
              title
            )}
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {truncate(product.description ?? 'No product description available yet.', compact ? 88 : 120)}
            </p>
          </div>
          <div className="rounded-2xl bg-brand-secondary px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Price</p>
            <p className="mt-1 text-sm font-semibold text-brand-text">{formatCurrency(product.price)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
          <Badge tone={product.stock > 0 ? 'success' : 'danger'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </Badge>
          <Badge tone="neutral">
            <Star className="h-3 w-3 fill-current" />
            4.8 rating
          </Badge>
        </div>

        {actions ? (
          <div className="grid gap-2 sm:grid-cols-2">{actions}</div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" className="flex-1">
              <Heart className="h-4 w-4" />
              Wishlist
            </Button>
            <Button className="flex-1">
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

