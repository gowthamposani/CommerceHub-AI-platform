import type { OrderStatus, UserStatus } from '../types/domain';
import { formatOrderStatus } from './format';

export function getOrderStatusLabel(status: OrderStatus): string {
  return formatOrderStatus(status);
}

export function getOrderStatusTone(status: OrderStatus): 'primary' | 'info' | 'warning' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'out_for_delivery':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'packed':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'placed':
    default:
      return 'neutral';
  }
}

export function getUserStatusTone(status: UserStatus): 'primary' | 'info' | 'warning' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending_approval':
      return 'warning';
    case 'inactive':
      return 'neutral';
    case 'suspended':
      return 'danger';
    default:
      return 'neutral';
  }
}

