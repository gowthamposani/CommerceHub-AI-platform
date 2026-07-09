import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import type { InventoryMetrics, OrderMetrics, ProductMetrics, RevenueMetrics, WarehouseMetrics, CustomerMetrics } from "@/types/sellerDashboard";

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-950">{value}</span>
    </div>
  );
}

export function SellerDashboardWidgets({
  products,
  inventory,
  warehouses,
  orders,
  revenue,
  customers
}: {
  products: ProductMetrics;
  inventory: InventoryMetrics;
  warehouses: WarehouseMetrics;
  orders: OrderMetrics;
  revenue: RevenueMetrics;
  customers: CustomerMetrics;
}) {
  const capacity = Number(warehouses.capacity_utilization) || 0;
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Product Overview</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Active Products" value={formatNumber(products.active_products)} />
          <MetricRow label="Draft Products" value={formatNumber(products.draft_products)} />
          <MetricRow label="Disabled Products" value={formatNumber(products.disabled_products)} />
          <MetricRow label="Out of Stock" value={formatNumber(products.out_of_stock_products)} />
          <MetricRow label="Low Stock" value={formatNumber(products.low_stock_products)} />
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/products/new"><Button size="sm">Add Product</Button></Link>
            <Link to="/products"><Button size="sm" variant="secondary">View Products</Button></Link>
            <Link to="/inventory"><Button size="sm" variant="secondary">Manage Inventory</Button></Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Inventory Overview</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Total Inventory" value={formatNumber(inventory.total_inventory)} />
          <MetricRow label="Reserved Inventory" value={formatNumber(inventory.reserved_inventory)} />
          <MetricRow label="Available Inventory" value={formatNumber(inventory.available_inventory)} />
          <MetricRow label="Inventory Value" value={formatCurrency(Number(inventory.inventory_value) || 0)} />
          <MetricRow label="Low Stock Alerts" value={formatNumber(inventory.stock_alerts.length)} />
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/inventory"><Button size="sm">Update Stock</Button></Link>
            <Link to="/inventory"><Button size="sm" variant="secondary">View Inventory</Button></Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Warehouse Operations</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Total Warehouses" value={formatNumber(warehouses.total_warehouses)} />
          <MetricRow label="Active Warehouses" value={formatNumber(warehouses.active_warehouses)} />
          <MetricRow label="Disabled Warehouses" value={formatNumber(warehouses.disabled_warehouses)} />
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Capacity Used</span>
              <span className="font-bold text-gray-950">{capacity.toFixed(2)}%</span>
            </div>
            <Progress value={Math.min(capacity, 100)} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/warehouses"><Button size="sm">View Warehouses</Button></Link>
            <Link to="/warehouses/new"><Button size="sm" variant="secondary">Create Warehouse</Button></Link>
            <Link to="/warehouses"><Button size="sm" variant="secondary">Transfer Inventory</Button></Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Orders</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Pending" value={formatNumber(orders.pending_orders)} />
          <MetricRow label="Confirmed" value={formatNumber(orders.confirmed_orders)} />
          <MetricRow label="Packed" value={formatNumber(orders.packed_orders)} />
          <MetricRow label="Shipped" value={formatNumber(orders.shipped_orders)} />
          <MetricRow label="Delivered" value={formatNumber(orders.delivered_orders)} />
          <MetricRow label="Cancelled" value={formatNumber(orders.cancelled_orders)} />
          <MetricRow label="Returned" value={formatNumber(orders.returned_orders)} />
          <Link to="/modules"><Button size="sm" variant="secondary">View Orders</Button></Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Revenue</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Today" value={formatCurrency(Number(revenue.today_revenue) || 0)} />
          <MetricRow label="Weekly" value={formatCurrency(Number(revenue.weekly_revenue) || 0)} />
          <MetricRow label="Monthly" value={formatCurrency(Number(revenue.monthly_revenue) || 0)} />
          <MetricRow label="Yearly" value={formatCurrency(Number(revenue.yearly_revenue) || 0)} />
          <MetricRow label="Average Order Value" value={formatCurrency(Number(revenue.average_order_value) || 0)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Customers</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Total Customers" value={formatNumber(customers.total_customers)} />
          <MetricRow label="Returning Customers" value={formatNumber(customers.returning_customers)} />
          <MetricRow label="New Customers" value={formatNumber(customers.new_customers)} />
          <MetricRow label="Retention Rate" value={`${Number(customers.customer_retention_rate || 0).toFixed(2)}%`} />
          <Link to="/modules"><Button size="sm" variant="secondary">View Customers</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
