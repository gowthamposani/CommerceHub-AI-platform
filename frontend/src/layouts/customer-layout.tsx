import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Heart,
  Home,
  LogOut,
  MapPinned,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { appConfig } from '../config';
import { useAuth } from '../auth/use-auth';
import { Button, Card } from '../components/ui';
import { initials } from '../utils/format';
import { cn } from '../utils/cn';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/addresses', label: 'Addresses', icon: MapPinned },
  { to: '/checkout', label: 'Checkout', icon: PackageSearch },
];

export function CustomerLayout(): React.ReactElement {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login', { replace: true, state: { from: location } });
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <Card className="sticky top-4 overflow-hidden p-0">
            <div className="bg-[linear-gradient(135deg,rgba(201,139,43,0.18),rgba(245,242,237,0.95))] px-6 py-6">
              <Link to="/home" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-soft">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-none text-brand-text">{appConfig.appName}</p>
                  <p className="mt-1 text-xs text-brand-muted">Customer workspace</p>
                </div>
              </Link>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-sm font-semibold text-white">
                  {initials(user?.first_name, user?.last_name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-text">{user?.full_name ?? 'Customer'}</p>
                  <p className="truncate text-xs text-brand-muted">{user?.email ?? 'Signed in'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1 p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-primary text-white shadow-soft'
                        : 'text-brand-text hover:bg-brand-secondary/80',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-brand-border p-4">
              <Button variant="secondary" fullWidth onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="lg:hidden">
            <Card className="mb-4 flex items-center justify-between px-4 py-4">
              <Link to="/home" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-text">{appConfig.appName}</p>
                  <p className="text-xs text-brand-muted">Customer portal</p>
                </div>
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="px-3">
                <LogOut className="h-4 w-4" />
              </Button>
            </Card>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-brand-border bg-white text-brand-text hover:border-brand-primary/30',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </header>

          <main className="pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
