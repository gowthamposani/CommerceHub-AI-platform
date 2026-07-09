import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, PackageCheck, Sparkles } from 'lucide-react';

import { checkoutOrder } from '../api/order';
import { getCart } from '../api/cart';
import { getCustomerProfile } from '../api/customer';
import { getApiErrorMessage } from '../api/error';
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingScreen,
  SectionHeader,
} from '../components/ui';
import { formatCurrency } from '../utils/format';
import type { Address, Cart } from '../types/domain';

export function CheckoutPage(): React.ReactElement {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      const [cartResult, profileResult] = await Promise.allSettled([getCart(), getCustomerProfile()]);

      if (cancelled) {
        return;
      }

      if (cartResult.status === 'fulfilled') {
        setCart(cartResult.value);
      } else {
        setError(getApiErrorMessage(cartResult.reason, 'Unable to load cart details.'));
      }

      if (profileResult.status === 'fulfilled') {
        setAddresses(profileResult.value.addresses);
        const defaultAddress = profileResult.value.addresses.find((address) => address.is_default) ?? profileResult.value.addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }

      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const handleCheckout = async (): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const order = await checkoutOrder({
        payment_id: paymentReference.trim() ? paymentReference.trim() : undefined,
      });
      setMessage('Your order was placed successfully.');
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not complete checkout.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading checkout" description="Checking your cart and saved addresses before checkout." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={<PackageCheck className="h-8 w-8" />}
        title="Your cart is empty"
        description="Add products to the cart before opening checkout."
        action={<ButtonLink to="/products">Browse products</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Checkout"
        title="Review and place your order"
        description="The backend will validate stock, create the order transactionally, and clear the cart after success."
      />

      {message ? <Alert tone="success" title="Order placed">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Checkout error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Delivery review</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">Choose a saved address</h2>
          </div>

          {addresses.length === 0 ? (
            <Alert tone="warning" title="No saved addresses">
              You can still place the order, but adding an address now makes future checkouts faster.
            </Alert>
          ) : (
            <Field label="Shipping address" htmlFor="checkout-address">
              <select
                id="checkout-address"
                className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-text shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                value={selectedAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.address_line_1}, {address.city}
                    {address.is_default ? ' (default)' : ''}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Payment reference" htmlFor="payment-reference" hint="Optional if your payment flow supplies a reference ID.">
            <Input
              id="payment-reference"
              placeholder="Optional payment id"
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
            />
          </Field>

          {selectedAddress ? (
            <Card className="rounded-3xl bg-brand-secondary/40 p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-brand-primaryDark" />
                <div>
                  <p className="text-sm font-semibold text-brand-text">Selected address</p>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {selectedAddress.address_line_1}
                    {selectedAddress.address_line_2 ? `, ${selectedAddress.address_line_2}` : ''}
                    <br />
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                    <br />
                    {selectedAddress.country}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          <Button fullWidth disabled={busy} onClick={() => void handleCheckout()}>
            <CreditCard className="h-4 w-4" />
            Place order
          </Button>
        </Card>

        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Order summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-text">Cart details</h2>
            </div>
            <Sparkles className="h-6 w-6 text-brand-primaryDark" />
          </div>

          <div className="space-y-3 rounded-3xl bg-brand-secondary/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Items</span>
              <span className="font-semibold text-brand-text">{cart.item_count}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Quantity</span>
              <span className="font-semibold text-brand-text">{cart.total_quantity}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Subtotal</span>
              <span className="font-semibold text-brand-text">{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-brand-border pt-3 text-base">
              <span className="font-semibold text-brand-text">Grand total</span>
              <span className="text-xl font-semibold text-brand-primaryDark">{formatCurrency(cart.grand_total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">
                      {item.product_title ?? `Item ${item.product_id.slice(0, 8)}`}
                    </p>
                    <p className="mt-2 text-sm text-brand-muted">Quantity {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-brand-text">{formatCurrency(item.line_total)}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl bg-brand-secondary/40 px-4 py-3 text-xs text-brand-muted">
            Checkout uses the authenticated cart, creates the order transactionally, and then clears the cart.
          </div>
        </Card>
      </div>
    </div>
  );
}
