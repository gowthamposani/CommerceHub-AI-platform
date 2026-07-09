import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { ChevronDown, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Popover } from "@/components/ui/Popover";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export function Navbar({
  collapsed,
  onToggleSidebar,
  onToggleMobile
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { session, logout } = useAuth();
  const userName = session ? `${session.user.first_name} ${session.user.last_name}` : "Guest";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleMobile} aria-label="Open navigation">
          <Bars3Icon className="h-6 w-6" />
        </Button>
        <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onToggleSidebar}>
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </Tooltip>
        <div>
          <p className="text-sm font-bold text-gray-950">Frontend Foundation</p>
          <p className="hidden text-xs text-gray-500 sm:block">Reusable platform shell for future modules</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <Popover
          trigger={
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <BellIcon className="h-6 w-6" />
            </Button>
          }
        >
          <p className="text-sm font-bold text-gray-900">Notifications</p>
          <p className="mt-1 text-sm text-gray-600">Notification infrastructure placeholder.</p>
        </Popover>
        <Dropdown
          trigger={
            <button
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
              aria-label="Open profile menu"
            >
              <Avatar name={userName} />
              <ChevronDown className="hidden h-4 w-4 text-gray-500 sm:block" />
            </button>
          }
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-bold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{session?.user.email ?? "Not signed in"}</p>
          </div>
          {session ? (
            <button
              className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold text-brand-red hover:bg-red-50"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          ) : null}
        </Dropdown>
      </div>
    </header>
  );
}
