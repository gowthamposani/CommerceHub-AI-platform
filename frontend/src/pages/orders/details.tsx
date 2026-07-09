import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, Clock3, Package, Truck } from 'lucide-react';

import { cancelOrder, getOrder } from '../../api/order';
import { getApiErrorMessage } from '../../api/error';
import { Button, ButtonLink, Card, EmptyState, LoadingScreen, SectionHeader, Alert, Badge } from '../../components/ui';
import { formatCurrency, formatDateTime, shortId } from '../../utils/format';
import { getOrderStatusLabel, getOrderStatusTone } from '../../utils/status';
import type { Order, OrderStatus } from '../../types/domain';

const timeline: Array<{ status: OrderStatus; label: string; icon: React.ReactNode }> = [
  { status: 'placed', label: 'Placed', icon: <Clock3 className="h-4 w-4" /> },
  { status: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: 'packed', label: 'Packed', icon: <Package className="h-4 w-4" /> },
  { status: 'shipped', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
  { status: 'out_for_delivery', label: 'Out for delivery', icon: <Truck className="h-4 w-4" /> },
  { status: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: 'cancelled', label: 'Cancelled', icon: <Ban className="h-4 w-4" /> },
];

const cancellableStatuses: OrderStatus[] = ['placed', 'confirmed', 'packed'];

export function OrderDetailsPage(): React.ReactElement {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!orderId) {
        setError('Order id is missing from the route.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextOrder = await getOrder(orderId);
        if (!cancelled) {
          setOrder(nextOrder);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError, 'Unable to load order details.'));
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
  }, [orderId]);

  const activeStepIndex = useMemo(() => {
    if (!order) {
      return -1;
    }

    const index = timeline.findIndex((step) => step.status === order.status);
    return index >= 0 ? index : -1;
  }, [order]);

  const handleCancel = async (): Promise<void> => {
    if (!order) {
      return;
    }

    if (!window.confirm('Cancel this order before it is shipped?')) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const nextOrder = await cancelOrder(order.id);
      setOrder(nextOrder);
      setMessage('Order cancelled successfully.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not cancel this order.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading order details" description="Retrieving a complete breakdown of the selected order." />;
  }

  if (!order) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="Order not found"
        description={error ?? 'This order does not exist or you do not have access to it.'}
        action={<ButtonLink to="/orders">Back to orders</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ButtonLink to="/orders" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </ButtonLink>
        <Badge tone={getOrderStatusTone(order.status)}>{getOrderStatusLabel(order.status)}</Badge>
      </div>

      {message ? <Alert tone="success" title="Order updated">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Order error">{error}</Alert> : null}

      <SectionHeader
        eyebrow="Order details"
        title={`Order ${shortId(order.id, 12)}`}
        description={`Placed on ${formatDateTime(order.created_at)} · ${order.item_count} items · Total ${formatCurrency(order.total_amount)}`}
        action={
          cancellableStatuses.includes(order.status) ? (
            <Button variant="secondary" disabled={busy} onClick={() => void handleCancel()}>
              <Ban className="h-4 w-4" />
              Cancel order
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Lifecycle</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">Order progression</h2>
          </div>

          <div className="space-y-3">
            {timeline.map((step, index) => {
              const isComplete = activeStepIndex >= index;
              const isCurrent = activeStepIndex === index;
              return (
                <div
                  key={step.status}
                  className={`flex items-center gap-4 rounded-3xl border px-4 py-3 ${
                    isCurrent
                      ? 'border-brand-primary bg-brand-primary/8'
                      : isComplete
                        ? 'border-emerald-200 bg-emerald-50/70'
                        : 'border-brand-border bg-white'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isComplete ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-primaryDark'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-text">{step.label}</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      {isCurrent ? 'Current status' : isComplete ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  {isCurrent ? <Badge tone="primary">Active</Badge> : null}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Items</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">Order summary</h2>
          </div>

          <div className="space-y-3 rounded-3xl bg-brand-secondary/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Quantity</span>
              <span className="font-semibold text-brand-text">{order.total_quantity}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Items</span>
              <span className="font-semibold text-brand-text">{order.item_count}</span>
            </div>
            <div className="flex items-center justify-between border-t border-brand-border pt-3 text-sm">
              <span className="font-semibold text-brand-text">Total amount</span>
              <span className="text-lg font-semibold text-brand-primaryDark">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-text">
                      {item.product_title ?? `Item ${shortId(item.product_id)}`}
                    </p>
                    <p className="mt-2 text-sm text-brand-muted">
                      Quantity {item.quantity} · Unit {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-brand-text">{formatCurrency(item.line_total)}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl bg-brand-secondary/40 px-4 py-3 text-xs text-brand-muted">
            Order ID: {order.id}
            {order.payment_id ? ` · Payment reference: ${order.payment_id}` : ''}
          </div>
        </Card>
      </div>
    </div>
  );
}
