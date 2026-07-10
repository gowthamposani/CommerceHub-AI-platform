import { Navigate, Route, Routes } from "react-router-dom";

import { CustomerLayout } from "./layouts/customer-layout";
import { PublicLayout } from "./layouts/public-layout";
import { ProtectedRoute } from "./routes/protected-route";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { HomePage } from "./pages/home";
import { ProductListingPage } from "./pages/products/listing";
import { ProductDetailsPage } from "./pages/products/details";
import { WishlistPage } from "./pages/wishlist";
import { CartPage } from "./pages/cart";
import { CheckoutPage } from "./pages/checkout";
import { OrdersPage } from "./pages/orders/list";
import { OrderDetailsPage } from "./pages/orders/details";
import { CustomerProfilePage } from "./pages/customer/profile";
import { AddressManagementPage } from "./pages/customer/addresses";
import { NotFoundPage } from "./pages/not-found";

export default function App(): React.ReactElement {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<CustomerLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<CustomerProfilePage />} />
          <Route path="/addresses" element={<AddressManagementPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
