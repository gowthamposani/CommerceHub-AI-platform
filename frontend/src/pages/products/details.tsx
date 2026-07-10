import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Package, Plus, ShoppingCart, Sparkles, Minus } from "lucide-react";

import { addCartItem } from "../../api/cart";
import { addWishlistItem } from "../../api/wishlist";
import { getProduct } from "../../api/catalog";
import { getApiErrorMessage } from "../../api/error";
import { Button, Card, EmptyState, Field, Input, LoadingScreen, Alert, Badge, ButtonLink } from "../../components/ui";
import type { Product } from "../../types/domain";
import { formatCurrency } from "../../utils/format";
import { Button as UiButton } from "../../components/ui";

export function ProductDetailsPage(): React.ReactElement {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!productId) {
        setError("Product id is missing from the route.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getProduct(productId);
        if (cancelled) {
          return;
        }
        setProduct(result.item);
        setSource(result.source);
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError, "Unable to load the selected product."));
        }
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
  }, [productId]);

  useEffect(() => {
    if (product && quantity > product.stock && product.stock > 0) {
      setQuantity(product.stock);
    }
  }, [product, quantity]);

  const handleAddToCart = async (): Promise<void> => {
    if (!product) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      await addCartItem({ product_id: product.id, quantity });
      setMessage(`${product.title} added to your cart.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not add this product to the cart."));
    } finally {
      setBusy(false);
    }
  };

  const handleAddToWishlist = async (): Promise<void> => {
    if (!product) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      await addWishlistItem({ product_id: product.id });
      setMessage(`${product.title} added to your wishlist.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not add this product to the wishlist."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen title="Loading product" description="Fetching detailed information for the selected product." />
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="Product not found"
        description={error ?? "This item does not exist or is no longer available."}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink to="/products" variant="primary">
              Back to products
            </ButtonLink>
            <ButtonLink to="/cart" variant="secondary">
              View cart
            </ButtonLink>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ButtonLink to="/products" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </ButtonLink>
        <div className="flex items-center gap-2">
          <Badge tone={source === "demo" ? "warning" : "success"}>{source === "demo" ? "Preview" : "Live"}</Badge>
          <Badge tone={product.stock > 0 ? "success" : "danger"}>
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </Badge>
        </div>
      </div>

      {message ? (
        <Alert tone="success" title="Action complete">
          {message}
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" title="Product action failed">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <div className="relative h-80 bg-[linear-gradient(135deg,rgba(201,139,43,0.22),rgba(245,242,237,1))]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/80 shadow-soft">
                <Sparkles className="h-12 w-12 text-brand-primaryDark" />
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <h1 className="text-3xl font-semibold text-brand-text">{product.title}</h1>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {product.description ?? "No description available yet."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Price</p>
                <p className="mt-2 text-xl font-semibold text-brand-text">{formatCurrency(product.price)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Stock</p>
                <p className="mt-2 text-xl font-semibold text-brand-text">{product.stock}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Category</p>
                <p className="mt-2 text-xl font-semibold text-brand-text">{product.category_id ?? "General"}</p>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Purchase options</p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-text">Add to cart or save for later</h2>
            </div>

            <Field label="Quantity" htmlFor="product-quantity" hint="The backend will validate stock and availability.">
              <div className="flex items-center gap-3">
                <UiButton
                  variant="secondary"
                  className="h-11 w-11 p-0"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Minus className="h-4 w-4" />
                </UiButton>
                <Input
                  id="product-quantity"
                  type="number"
                  min={1}
                  max={Math.max(product.stock, 1)}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                />
                <UiButton
                  variant="secondary"
                  className="h-11 w-11 p-0"
                  disabled={product.stock > 0 ? quantity >= product.stock : true}
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  <Plus className="h-4 w-4" />
                </UiButton>
              </div>
            </Field>

            <div className="rounded-2xl bg-brand-secondary/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Estimated total</p>
              <p className="mt-2 text-2xl font-semibold text-brand-text">{formatCurrency(product.price * quantity)}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button disabled={busy || product.stock <= 0} onClick={() => void handleAddToCart()}>
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => void handleAddToWishlist()}>
                <Heart className="h-4 w-4" />
                Wishlist
              </Button>
            </div>

            <ButtonLink to="/checkout" variant="secondary" fullWidth>
              Proceed to checkout
            </ButtonLink>

            <div className="rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-muted">
              Product ID: <span className="font-medium text-brand-text">{product.id}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
