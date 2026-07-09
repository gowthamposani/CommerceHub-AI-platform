import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Ban, ArrowRight } from 'lucide-react';

import { cancelOrder, listOrders } from '../../api/order';
import { getApiErrorMessage } from '../../api/error';
import { Button, ButtonLink, Card, EmptyState, LoadingScreen, SectionHeader, Alert, Badge } from '../../components/ui';
import { formatCurrency, formatDateTime, shortId } from '../../utils/format';
import { getOrderStatusLabel, getOrderStatusTone } from '../../utils/status';
import type { Order, OrderStatus } from '../../types/domain';

type Filter = 'all' | OrderStatus;

const cancellableStatuses: OrderStatus[] = ['placed', 'confirmed', 'packed'];

export function OrdersPage(): React.ReactElement {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setOrders(await listOrders());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load your orders right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );

  const handleCancel = async (orderId: string): Promise<void> => {
    if (!window.confirm('Cancel this order before it is shipped?')) {
      return;
    }

    setBusyOrderId(orderId);
    setMessage(null);
    setError(null);

    try {
      const nextOrder = await cancelOrder(orderId);
      setOrders((current) => current.map((order) => (order.id === nextOrder.id ? nextOrder : order)));
      setMessage('Order cancelled successfully.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not cancel this order.'));
    } finally {
      setBusyOrderId(null);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading orders" description="Retrieving your order history." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Orders"
        title="Your order history"
        description="Track the full lifecycle from placed to delivered, and cancel an order before it leaves the warehouse."
        action={<ButtonLink to="/products" variant="secondary">Browse products</ButtonLink>}
      />

      {message ? <Alert tone="success" title="Order update">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Order error">{error}</Alert> : null}

      <Card className="flex flex-wrap gap-2 p-4">
        {(['all', 'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] as const).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-text hover:border-brand-primary/30'
              }
            >
              {item === 'all' ? 'All' : getOrderStatusLabel(item)}
            </button>
          ),
        )}
      </Card>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title="No orders found"
          description="Place your first order to see order tracking here."
          action={<ButtonLink to="/products">Go shopping</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Order {shortId(order.id, 12)}</p>
                  <p className="mt-2 text-xs text-brand-muted">{formatDateTime(order.created_at)}</p>
                </div>
                <Badge tone={getOrderStatusTone(order.status)}>{getOrderStatusLabel(order.status)}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Items</p>
                  <p className="mt-2 text-lg font-semibold text-brand-text">{order.item_count}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Quantity</p>
                  <p className="mt-2 text-lg font-semibold text-brand-text">{order.total_quantity}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Total</p>
                  <p className="mt-2 text-lg font-semibold text-brand-text">{formatCurrency(order.total_amount)}</p>
                </Card>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink to={`/orders/${order.id}`}>
                  View details
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                {cancellableStatuses.includes(order.status) ? (
                  <Button
                    variant="secondary"
                    disabled={busyOrderId === order.id}
                    onClick={() => void handleCancel(order.id)}
                  >
                    <Ban className="h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
