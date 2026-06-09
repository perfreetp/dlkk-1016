import { useAppStore } from "@/store";
import {
  TrendingUp,
  Package,
  KeyRound,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const statCards = [
  {
    title: "今日销售额",
    value: "¥12,680",
    change: "+18.5%",
    positive: true,
    icon: DollarSign,
    gradient: "from-primary-500 to-primary-600",
    bg: "bg-primary-50",
  },
  {
    title: "在租玩具数",
    value: "46件",
    change: "+3",
    positive: true,
    icon: KeyRound,
    gradient: "from-secondary-500 to-secondary-600",
    bg: "bg-secondary-50",
  },
  {
    title: "库存总量",
    value: "2,148件",
    change: "-12",
    positive: false,
    icon: Package,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "待处理工单",
    value: "12件",
    change: "+5",
    positive: false,
    icon: Wrench,
    gradient: "from-warning to-orange-500",
    bg: "bg-orange-50",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const products = useAppStore((s) => s.products);
  const rentalOrders = useAppStore((s) => s.rentalOrders);
  const maintenanceOrders = useAppStore((s) => s.maintenanceOrders);
  const saleOrders = useAppStore((s) => s.saleOrders);

  const lowStockProducts = products.filter((p) => p.stock < p.safetyStock);
  const overdueRentals = rentalOrders.filter((r) => r.status === "overdue");
  const pendingMaintenance = maintenanceOrders.filter(
    (m) => m.status === "pending" || m.status === "processing"
  );
  const pendingSales = saleOrders.slice(0, 5);

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: "待处理", cls: "bg-orange-100 text-orange-700" },
    processing: { label: "处理中", cls: "bg-blue-100 text-blue-700" },
    overdue: { label: "已逾期", cls: "bg-red-100 text-red-700" },
    active: { label: "租借中", cls: "bg-blue-100 text-blue-700" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">工作台</h1>
          <p className="text-sm text-text-secondary mt-1">
            早上好，李明！今天是美好的一天 🎉
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn-outline"
            onClick={() => navigate("/sales")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            快速开单
          </button>
          <button className="btn-primary" onClick={() => navigate("/products")}>
            <TrendingUp className="w-4 h-4 mr-2" />
            商品管理
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="card !p-5 group cursor-pointer hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl ${card.bg} bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                    card.positive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {card.value}
              </div>
              <div className="text-sm text-text-secondary">{card.title}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-primary-500"></div>
              <h3 className="text-base font-bold text-text-primary">
                待处理事项
              </h3>
              <span className="badge bg-primary-100 text-primary-700">
                {pendingMaintenance.length + pendingSales.length}
              </span>
            </div>
            <button
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              onClick={() => navigate("/maintenance")}
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingMaintenance.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-primary-500 bg-gradient-to-r from-primary-50/50 to-transparent"
                onClick={() => navigate("/maintenance")}
              >
                <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  {m.type === "repair" ? (
                    <Wrench className="w-4 h-4 text-primary-600" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {m.orderNo} - {m.productName || "玩具清洗"}
                  </div>
                  <div className="text-xs text-text-tertiary truncate">
                    {m.description}
                  </div>
                </div>
                <span className={`badge ${statusMap[m.status]?.cls}`}>
                  {statusMap[m.status]?.label}
                </span>
              </div>
            ))}
            {pendingSales.slice(0, 2).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-secondary-500 bg-gradient-to-r from-secondary-50/50 to-transparent"
                onClick={() => navigate("/sales")}
              >
                <div className="w-9 h-9 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">
                    销售订单 {s.orderNo}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    ¥{s.totalAmount} · {s.createdAt}
                  </div>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700">
                  已支付
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-danger"></div>
              <h3 className="text-base font-bold text-text-primary">
                低库存预警
              </h3>
              <span className="badge bg-red-100 text-red-700">
                {lowStockProducts.length}
              </span>
            </div>
            <button
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              onClick={() => navigate("/inventory")}
            >
              补货 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50/50 transition-colors"
              >
                <img
                  src={p.imageUrl}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {p.categoryName}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-danger">
                    {p.stock}
                    <span className="text-xs font-normal text-text-tertiary ml-1">
                      /{p.safetyStock}
                    </span>
                  </div>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-danger to-orange-400 rounded-full"
                      style={{ width: `${Math.min(100, (p.stock / p.safetyStock) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-warning"></div>
              <h3 className="text-base font-bold text-text-primary">
                逾期提醒
              </h3>
              <span className="badge bg-orange-100 text-orange-700">
                {overdueRentals.length}
              </span>
            </div>
            <button
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              onClick={() => navigate("/rental")}
            >
              处理 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {overdueRentals.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-text-primary">
                    {r.memberName}
                  </span>
                </div>
                <div className="text-xs text-text-secondary mb-2 line-clamp-1">
                  {r.items.map((i) => i.productName).join("、")}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-orange-700">
                    <Clock className="w-3 h-3" />
                    逾期 3-7天
                  </div>
                  <div className="text-sm font-bold text-danger">
                    +¥{r.penalty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-secondary-500"></div>
          <h3 className="text-base font-bold text-text-primary">最近销售趋势</h3>
        </div>
        <div className="h-52 flex items-end justify-between gap-2 px-4">
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 30 + Math.random() * 70;
            const isToday = i === 13;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isToday
                      ? "bg-gradient-to-t from-primary-600 to-primary-400"
                      : "bg-gradient-to-t from-secondary-200 to-secondary-100 hover:from-secondary-300"
                  }`}
                  style={{ height: `${h}%` }}
                  title={`6月${i + 1}日`}
                ></div>
                <div className="text-[10px] text-text-tertiary">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
