export type RoleName = 'customer' | 'seller' | 'admin';
export type UserStatus = 'active' | 'pending_approval' | 'inactive' | 'suspended';
export type RegistrationRole = 'customer' | 'seller';

export interface AuthRole {
  id: string;
  name: RoleName;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: AuthRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  addresses?: Address[];
}

export interface AuthTokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  access_token_expires_at: string;
  refresh_token_expires_at: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokenPair;
}

export interface AuthRegistrationPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: RegistrationRole;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthRefreshPayload {
  refresh_token: string;
}

export interface Product {
  id: string;
  seller_id?: string | null;
  category_id?: string | null;
  title: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_title?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  customer_id: string;
  items: CartItem[];
  item_count: number;
  total_quantity: number;
  subtotal: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export interface AddCartItemPayload {
  product_id: string;
  quantity: number;
}

export interface UpdateCartQuantityPayload {
  quantity: number;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
}

export interface AddWishlistItemPayload {
  product_id: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  payment_id?: string | null;
  status: OrderStatus;
  items: OrderItem[];
  item_count: number;
  total_quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutRequest {
  payment_id?: string | null;
}

export interface Address {
  id: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile extends AuthUser {
  addresses: Address[];
}

export interface CustomerProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
}

export interface AddressCreatePayload {
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number?: string | null;
  is_default?: boolean;
}

export interface AddressUpdatePayload {
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone_number?: string | null;
}
