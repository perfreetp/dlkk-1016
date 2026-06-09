import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  KeyRound,
  ShoppingCart,
  Wrench,
  BarChart3,
  Bell,
  Search,
  User,
  Gamepad2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import ProductHistoryModal from "./ProductHistoryModal";

const navItems = [
  { to: "/", label: "首页", icon: LayoutDashboard },
  { to: "/products", label: "商品管理", icon: Package },
  { to: "/inventory", label: "库存管理", icon: Warehouse },
  { to: "/rental", label: "租借管理", icon: KeyRound },
  { to: "/sales", label: "销售管理", icon: ShoppingCart },
  { to: "/maintenance", label: "清洗维修", icon: Wrench },
  { to: "/reports", label: "报表设置", icon: BarChart3 },
];

const pageTitles: Record<string, string> = {
  "/": "工作台",
  "/products": "商品管理",
  "/inventory": "库存管理",
  "/rental": "租借管理",
  "/sales": "销售管理",
  "/maintenance": "清洗维修",
  "/reports": "报表与设置",
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || "工作台";

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 bg-surface border-r border-border flex flex-col fixed h-full z-30">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-text-primary leading-tight">
              童趣玩具屋
            </div>
            <div className="text-[10px] text-text-tertiary">
              TOY STORE ADMIN
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn("sidebar-item", isActive ? "sidebar-item-active" : "sidebar-item-inactive")
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100">
            <div className="text-xs font-medium text-text-primary mb-1">📊 今日提醒</div>
            <div className="text-[11px] text-text-secondary">
              待处理 <span className="font-semibold text-primary-600">12</span> · 逾期{" "}
              <span className="font-semibold text-danger">2</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>门店管理系统</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary font-medium">{currentTitle}</span>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                className="input pl-10 py-2"
                placeholder="搜索商品、会员、订单..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"></span>
            </button>
            <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-border">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                李
              </div>
              <div className="text-sm leading-tight">
                <div className="font-medium text-text-primary">李明</div>
                <div className="text-[10px] text-text-tertiary">店长</div>
              </div>
              <User className="w-4 h-4 text-text-tertiary" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
      <ProductHistoryModal />
    </div>
  );
}
