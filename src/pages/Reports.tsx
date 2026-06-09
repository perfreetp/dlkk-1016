import { useState, useMemo } from "react";
import type { StockRecord } from "@/types";
import { useAppStore } from "../store";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Package,
  DollarSign,
  Store,
  Users,
  Truck,
  Tags,
  Plus,
  Edit2,
  Trash2,
  X,
  Phone,
  MapPin,
  Mail,
  UserCheck,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Building,
  BadgeDollarSign,
  RefreshCw,
  AlertTriangle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReportTab = "hot" | "turnover" | "profit" | "stock_daily" | "stock_check";
type SettingsTab = "store" | "employee" | "supplier" | "tag";

const COLORS = ["#FF6B35", "#1A73E8", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];

export default function Reports() {
  const {
    products,
    saleOrders,
    categories,
    stockRecords,
    store,
    updateStore,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    tags,
    addTag,
    updateTag,
    deleteTag,
    transferOrders,
  } = useAppStore();

  const [reportTab, setReportTab] = useState<ReportTab>("hot");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("store");
  const [showModal, setShowModal] = useState<{ type: string; data?: any } | null>(null);

  // ============ 热销报表数据 ============
  const hotSalesData = useMemo(() => {
    const productSales: Record<string, { name: string; qty: number; revenue: number; category: string }> = {};
    saleOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          const p = products.find((x) => x.id === item.productId);
          productSales[item.productId] = {
            name: p?.name || item.productName,
            qty: 0,
            revenue: 0,
            category: categories.find((c) => c.id === p?.categoryId)?.name || "-",
          };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.price;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
      .map((x, i) => ({ ...x, rank: i + 1 }));
  }, [saleOrders, products, categories]);

  // ============ 分类占比 ============
  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {};
    saleOrders.forEach((order) => {
      order.items.forEach((item) => {
        const p = products.find((x) => x.id === item.productId);
        const cat = categories.find((c) => c.id === p?.categoryId)?.name || "其他";
        map[cat] = (map[cat] || 0) + item.quantity * item.price;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [saleOrders, products, categories]);

  // ============ 周转分析数据 ============
  const turnoverData = useMemo(() => {
    const months = ["1月", "2月", "3月", "4月", "5月", "6月"];
    return months.map((m, i) => ({
      month: m,
      turnover: +(80 + Math.random() * 40 + i * 8).toFixed(1),
      averageDays: +(18 - i * 1.2 + Math.random() * 3).toFixed(1),
      stockCost: 120 + i * 15 + Math.floor(Math.random() * 30),
    }));
  }, []);

  const slowMovingProducts = useMemo(() => {
    return products
      .filter((p) => p.stock > 0)
      .map((p) => {
        const sold = saleOrders.reduce(
          (sum, o) => sum + o.items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.quantity, 0),
          0
        );
        const daysOnShelf = p.stock > 0 ? Math.floor((30 * p.stock) / Math.max(sold, 1)) : 0;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          sold,
          daysOnShelf,
          cost: p.costPrice,
          value: p.stock * p.costPrice,
        };
      })
      .sort((a, b) => b.daysOnShelf - a.daysOnShelf)
      .slice(0, 6);
  }, [products, saleOrders]);

  // ============ 利润报表数据 ============
  const profitData = useMemo(() => {
    const months = ["1月", "2月", "3月", "4月", "5月", "6月"];
    return months.map((m, i) => {
      const revenue = 28000 + i * 3500 + Math.floor(Math.random() * 5000);
      const cost = Math.floor(revenue * (0.52 - i * 0.015));
      return {
        month: m,
        revenue,
        cost,
        profit: revenue - cost,
        profitRate: +(((revenue - cost) / revenue) * 100).toFixed(1),
      };
    });
  }, []);

  const totalRevenue = profitData.reduce((s, x) => s + x.revenue, 0);
  const totalProfit = profitData.reduce((s, x) => s + x.profit, 0);
  const totalProfitRate = +((totalProfit / totalRevenue) * 100).toFixed(1);

  // ============ 总收入汇总 ============
  const summaryCards = useMemo(() => {
    const totalSales = saleOrders.reduce((s, o) => s + o.totalAmount, 0);
    const profit = totalSales * 0.42;
    const soldItems = saleOrders.reduce((s, o) => s + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);
    const avgOrder = saleOrders.length ? +(totalSales / saleOrders.length).toFixed(2) : 0;
    return { totalSales, profit, soldItems, avgOrder };
  }, [saleOrders]);

  // ============ 设置面板逻辑 ============
  const [formState, setFormState] = useState<any>({});
  const [searchText, setSearchText] = useState("");

  // ============ 库存异动日报 ============
  const storeList = ["全部门店", "海淀店", "朝阳店", "中关村店", "西城店"];

  const [dailyDate, setDailyDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dailyStore, setDailyStore] = useState<string>("全部门店");
  const [dailyCategory, setDailyCategory] = useState<string>("全部");
  const [selectedDailyType, setSelectedDailyType] = useState<string | null>(null);
  const orderFocus = useAppStore((s) => s.orderFocus);
  const setOrderFocus = useAppStore((s) => s.setOrderFocus);

  const jumpFromReport = (orderNo: string, type: string) => {
    let page: "inventory" | "sales" | "rental" = "inventory";
    let tab: string | undefined;
    if (type === "sale" || type === "sale_return") { page = "sales"; }
    else if (type === "rental_out" || type === "rental_in") { page = "rental"; }
    else if (type.startsWith("transfer")) { tab = "transfer"; }
    else if (type === "inbound") { tab = "inbound"; }
    else if (type === "damage") { tab = "damage"; }
    else if (type === "stocktake") { tab = "stocktake"; }
    setOrderFocus({ orderNo, page, tab });
  };

  const dailyTypeConfig: Record<
    string,
    { label: string; dir: "+" | "-" | "±"; cls: string; color: string }
  > = {
    inbound: { label: "入库", dir: "+", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", color: "#10B981" },
    sale: { label: "销售", dir: "-", cls: "bg-orange-50 text-orange-700 border-orange-200", color: "#F97316" },
    sale_return: { label: "销售退货", dir: "+", cls: "bg-pink-50 text-pink-700 border-pink-200", color: "#EC4899" },
    rental_out: { label: "租出", dir: "-", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", color: "#6366F1" },
    rental_in: { label: "归还", dir: "+", cls: "bg-cyan-50 text-cyan-700 border-cyan-200", color: "#06B6D4" },
    damage: { label: "报损", dir: "-", cls: "bg-red-50 text-red-700 border-red-200", color: "#EF4444" },
    stocktake: { label: "盘点差异", dir: "±", cls: "bg-purple-50 text-purple-700 border-purple-200", color: "#8B5CF6" },
    transfer_in: { label: "调拨入库", dir: "+", cls: "bg-blue-50 text-blue-700 border-blue-200", color: "#3B82F6" },
    transfer_out: { label: "调拨出库", dir: "-", cls: "bg-sky-50 text-sky-700 border-sky-200", color: "#0EA5E9" },
  };

  const dailySummary = useMemo(() => {
    const transferMap = new Map(transferOrders.map((t) => [t.orderNo, t]));
    let list = stockRecords.filter((r) => r.createdAt.slice(0, 10) === dailyDate);

    list = list.filter((r) => {
      if (dailyCategory === "全部") return true;
      const p = products.find((x) => x.id === r.productId);
      return p?.categoryId === dailyCategory || categories.find((c) => c.id === p?.categoryId)?.parentId === dailyCategory;
    });

    list = list.filter((r) => {
      if (dailyStore === "全部门店") return true;
      if (r.type === "transfer") {
        const t = transferMap.get(r.relatedOrderNo);
        if (!t) return false;
        return r.remark?.includes("入库") ? t.toStore === dailyStore : t.fromStore === dailyStore;
      }
      return true;
    });

    const agg: Record<string, { qty: number; amount: number }> = {};
    const typeList = Object.keys(dailyTypeConfig);
    typeList.forEach((k) => (agg[k] = { qty: 0, amount: 0 }));

    list.forEach((r) => {
      const p = products.find((x) => x.id === r.productId);
      const cost = p?.costPrice || 0;
      const sale = p?.salePrice || 0;
      const rental = p?.rentalPrice || 0;
      let key: string = r.type;
      if (r.type === "transfer") key = r.remark?.includes("入库") ? "transfer_in" : "transfer_out";
      const dir = dailyTypeConfig[key]?.dir || "±";
      const qtySign =
        dir === "+" ? 1 : dir === "-" ? -1 : r.type === "stocktake" ? (r.afterStock > r.beforeStock ? 1 : -1) : 0;
      const qtyAbs = r.quantity;
      let amt = 0;
      if (r.type === "sale") amt = qtyAbs * sale;
      else if (r.type === "sale_return") amt = qtyAbs * sale;
      else if (r.type === "rental_out") amt = qtyAbs * rental * 3;
      else if (r.type === "rental_in") amt = 0;
      else amt = qtyAbs * cost;

      if (!agg[key]) agg[key] = { qty: 0, amount: 0 };
      agg[key].qty += qtySign * qtyAbs;
      agg[key].amount += amt;
    });

    const rows = typeList
      .filter((k) => agg[k].qty !== 0 || agg[k].amount > 0)
      .map((k) => ({ type: k, ...agg[k], cfg: dailyTypeConfig[k] }));

    const totalIn = typeList.reduce((s, k) => {
      if (dailyTypeConfig[k].dir === "+" && agg[k].qty > 0) return s + agg[k].qty;
      return s;
    }, 0);
    const totalOut = typeList.reduce((s, k) => {
      if (dailyTypeConfig[k].dir === "-" && agg[k].qty < 0) return s + Math.abs(agg[k].qty);
      return s;
    }, 0);
    const netQty = totalIn - totalOut;
    const totalValue = rows.reduce((s, r) => s + r.amount, 0);

    return { rows, totalIn, totalOut, netQty, totalValue, count: list.length, list };
  }, [stockRecords, dailyDate, dailyStore, dailyCategory, products, categories, transferOrders]);

  // ============ 库存异常核对 ============
  const rentalOrders = useAppStore((s) => s.rentalOrders);
  const stockCheckData = useMemo(() => {
    const recordsByProduct: Record<string, StockRecord[]> = {};
    stockRecords.forEach((r) => {
      if (!recordsByProduct[r.productId]) recordsByProduct[r.productId] = [];
      recordsByProduct[r.productId].push(r);
    });

    // 租借占用：active/overdue 的在租数量
    const rentalOccupied: Record<string, number> = {};
    rentalOrders.forEach((r) => {
      if (r.status !== "active" && r.status !== "overdue") return;
      r.items.forEach((it) => {
        rentalOccupied[it.productId] = (rentalOccupied[it.productId] || 0) + it.quantity;
      });
    });

    const data = products.map((p) => {
      const records = recordsByProduct[p.id] || [];
      let plusQty = 0, minusQty = 0;
      records.forEach((r) => {
        const isPlus = r.type === "inbound" || r.type === "rental_in" || r.type === "sale_return" ||
          (r.type === "transfer" && r.remark?.includes("入库")) ||
          (r.type === "stocktake" && r.afterStock > r.beforeStock);
        const isMinus = r.type === "sale" || r.type === "rental_out" || r.type === "damage" ||
          (r.type === "transfer" && !r.remark?.includes("入库")) ||
          (r.type === "stocktake" && r.afterStock < r.beforeStock);
        if (isPlus) plusQty += r.quantity;
        if (isMinus) minusQty += r.quantity;
      });
      const calcStock = p.stock + minusQty - plusQty;
      const occupied = rentalOccupied[p.id] || 0;
      const diff = p.stock - calcStock;
      const isMismatch = diff !== 0;
      const availableForRent = Math.max(0, p.stock - occupied);

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: categories.find((c) => c.id === p.categoryId)?.name || "-",
        currentStock: p.stock,
        calcStock,
        plusQty,
        minusQty,
        occupied,
        availableForRent,
        diff,
        isMismatch,
      };
    });

    const mismatchCount = data.filter((d) => d.isMismatch).length;
    const occupiedTotal = data.reduce((s, d) => s + d.occupied, 0);
    const totalAvailableForRent = data.reduce((s, d) => s + d.availableForRent, 0);

    return {
      items: data,
      mismatchItems: data.filter((d) => d.isMismatch),
      mismatchCount,
      totalItems: data.length,
      occupiedTotal,
      totalAvailableForRent,
      diffQty: mismatchCount > 0 ? data.reduce((s, d) => s + Math.abs(d.diff), 0) : 0,
    };
  }, [products, stockRecords, rentalOrders, categories]);

  const openModal = (type: string, data?: any) => {
    setFormState(data ? { ...data } : {});
    setShowModal({ type, data });
  };

  const submitModal = () => {
    if (!showModal) return;
    const { type, data } = showModal;

    if (type === "store") {
      updateStore(formState);
    } else if (type === "employee") {
      if (data) updateEmployee(data.id, formState);
      else addEmployee({ id: `emp${Date.now()}`, ...formState, createdAt: new Date().toISOString().slice(0, 10) });
    } else if (type === "supplier") {
      if (data) updateSupplier(data.id, formState);
      else addSupplier({ id: `sup${Date.now()}`, ...formState, createdAt: new Date().toISOString().slice(0, 10) });
    } else if (type === "tag") {
      if (data) updateTag(data.id, formState);
      else addTag({ id: `tag${Date.now()}`, ...formState, color: formState.color || "#FF6B35" });
    }
    setShowModal(null);
  };

  const handleDelete = (type: string, id: string) => {
    if (window.confirm("确定删除此记录？")) {
      if (type === "employee") deleteEmployee(id);
      else if (type === "supplier") deleteSupplier(id);
      else if (type === "tag") deleteTag(id);
    }
  };

  const filteredEmployees = employees.filter(e => !searchText || e.name.includes(searchText) || e.phone.includes(searchText));
  const filteredSuppliers = suppliers.filter(s => !searchText || s.name.includes(searchText) || s.contact.includes(searchText));
  const filteredTags = tags.filter(t => !searchText || t.name.includes(searchText));

  const roleLabels: Record<string, string> = { manager: "店长", staff: "店员", cleaner: "清洗员" };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-900">报表设置</h1>
          <p className="text-sm text-text-500 mt-1">经营数据分析与系统基础配置管理</p>
        </div>
      </div>

      {/* ============ 顶部总览 KPI ============ */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "累计销售额", value: `¥${summaryCards.totalSales.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", up: true, color: "from-primary-500 to-primary-400" },
          { label: "累计订单数", value: saleOrders.length, icon: Package, trend: "+8.2%", up: true, color: "from-secondary-500 to-secondary-400" },
          { label: "售出商品数", value: summaryCards.soldItems, icon: TrendingUp, trend: "+15.3%", up: true, color: "from-success-500 to-success-400" },
          { label: "客单价", value: `¥${summaryCards.avgOrder}`, icon: BadgeDollarSign, trend: "-1.2%", up: false, color: "from-purple-500 to-purple-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="card-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-text-500 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-text-900">{kpi.value}</div>
                <div className={`text-xs mt-2 flex items-center gap-1 ${kpi.up ? "text-success-600" : "text-danger-600"}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{kpi.trend}</span>
                  <span className="text-text-400 ml-1">vs 上月</span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-sm`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============ 报表区域 ============ */}
      <div className="card-sm">
        <div className="flex items-center justify-between border-b border-border-100 px-5 py-3">
          <div className="flex gap-1">
            {[
              { key: "hot", label: "热销分析", icon: TrendingUp },
              { key: "turnover", label: "周转分析", icon: RefreshCw },
              { key: "profit", label: "利润分析", icon: DollarSign },
              { key: "stock_daily", label: "库存异动日报", icon: Package },
              { key: "stock_check", label: "库存异常核对", icon: AlertTriangle },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setReportTab(t.key as ReportTab)}
                className={`tab ${reportTab === t.key ? "tab-active" : "tab-inactive"} flex items-center gap-1.5`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-text-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            数据周期：
            {reportTab === "stock_daily" ? `当日 (${dailyDate})` : reportTab === "stock_check" ? "实时核对" : "近 6 个月"}
          </div>
        </div>

        <div className="p-5">
          {/* ====== 热销分析 ====== */}
          {reportTab === "hot" && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="font-semibold text-text-900 text-sm">TOP10 热销商品</div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hotSalesData} layout="vertical" margin={{ left: 40, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={11} width={100} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
                        cursor={{ fill: "#FFF7F3" }}
                      />
                      <Bar dataKey="qty" name="销售数量" fill="#FF6B35" radius={[0, 8, 8, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 table-wrap rounded-xl overflow-hidden border border-border-100">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>排名</th>
                        <th>商品</th>
                        <th>分类</th>
                        <th className="text-right">销量</th>
                        <th className="text-right">销售额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotSalesData.slice(0, 5).map((row) => (
                        <tr key={row.rank}>
                          <td>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              row.rank === 1 ? "bg-primary-500 text-white" :
                              row.rank === 2 ? "bg-secondary-500 text-white" :
                              row.rank === 3 ? "bg-warning-500 text-white" :
                              "bg-background-100 text-text-600"
                            }`}>{row.rank}</span>
                          </td>
                          <td className="font-medium text-text-900">{row.name}</td>
                          <td className="text-text-500 text-sm">{row.category}</td>
                          <td className="text-right text-text-900 font-medium">{row.qty}</td>
                          <td className="text-right text-primary-600 font-semibold">¥{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-semibold text-text-900 text-sm">分类销售占比</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`¥${value.toLocaleString()}`, "销售额"]}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {categoryPieData.map((cat, i) => {
                    const total = categoryPieData.reduce((s, x) => s + x.value, 0);
                    const pct = +((cat.value / total) * 100).toFixed(1);
                    return (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-text-700">{cat.name}</span>
                        </div>
                        <span className="font-medium text-text-900">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ====== 周转分析 ====== */}
          {reportTab === "turnover" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div className="rounded-xl border border-border-100 p-4">
                  <div className="text-xs text-text-500 mb-1">平均周转次数</div>
                  <div className="text-xl font-bold text-text-900">128.6 次</div>
                  <div className="text-xs text-success-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +23.5%
                  </div>
                </div>
                <div className="rounded-xl border border-border-100 p-4">
                  <div className="text-xs text-text-500 mb-1">平均周转天数</div>
                  <div className="text-xl font-bold text-text-900">13.8 天</div>
                  <div className="text-xs text-success-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> -3.2 天
                  </div>
                </div>
                <div className="rounded-xl border border-border-100 p-4">
                  <div className="text-xs text-text-500 mb-1">库存资金占用</div>
                  <div className="text-xl font-bold text-text-900">¥245.8K</div>
                  <div className="text-xs text-danger-600 mt-1 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" /> +8.1%
                  </div>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={turnoverData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="stockCost" name="库存成本(千元)" fill="#1A73E820" stroke="#1A73E8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="turnover" name="周转次数" stroke="#FF6B35" strokeWidth={3} dot={{ fill: "#FF6B35", r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="averageDays" name="周转天数" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#10B981", r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="table-wrap rounded-xl overflow-hidden border border-border-100">
                <div className="px-4 py-3 border-b border-border-100 bg-background-50 font-semibold text-text-900 text-sm flex items-center gap-2">
                  <AlertIcon /> 滞销商品预警（Top 6）
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>商品名称</th>
                      <th>SKU</th>
                      <th className="text-right">当前库存</th>
                      <th className="text-right">累计售出</th>
                      <th className="text-right">上架天数</th>
                      <th className="text-right">占用资金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slowMovingProducts.map((row) => (
                      <tr key={row.id}>
                        <td className="font-medium text-text-900">{row.name}</td>
                        <td className="text-text-500 text-sm font-mono">{row.sku}</td>
                        <td className="text-right text-text-900">{row.stock}</td>
                        <td className="text-right text-text-500">{row.sold}</td>
                        <td className="text-right">
                          <span className={`font-medium ${row.daysOnShelf > 45 ? "text-danger-600" : row.daysOnShelf > 30 ? "text-warning-600" : "text-text-700"}`}>
                            {row.daysOnShelf} 天
                          </span>
                        </td>
                        <td className="text-right text-primary-600 font-medium">¥{row.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====== 利润分析 ====== */}
          {reportTab === "profit" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4 mb-2">
                <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 p-4 text-white">
                  <div className="text-xs opacity-80 mb-1">累计营业收入</div>
                  <div className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-400 p-4 text-white">
                  <div className="text-xs opacity-80 mb-1">累计成本支出</div>
                  <div className="text-2xl font-bold">¥{(totalRevenue - totalProfit).toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-success-500 to-success-400 p-4 text-white">
                  <div className="text-xs opacity-80 mb-1">累计毛利润</div>
                  <div className="text-2xl font-bold">¥{totalProfit.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 p-4 text-white">
                  <div className="text-xs opacity-80 mb-1">平均毛利率</div>
                  <div className="text-2xl font-bold">{totalProfitRate}%</div>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickLine={false} tickFormatter={(v) => v / 1000 + "K"} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} tickLine={false} tickFormatter={(v) => v + "%"} />
                    <Tooltip
                      formatter={(value: number, name) => {
                        if (name === "毛利率") return [value + "%", name];
                        return ["¥" + value.toLocaleString(), name];
                      }}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="营业收入" fill="#FF6B35" radius={[8, 8, 0, 0]} barSize={36} />
                    <Bar yAxisId="left" dataKey="cost" name="运营成本" fill="#6B7280" radius={[8, 8, 0, 0]} barSize={36} />
                    <Line yAxisId="right" type="monotone" dataKey="profitRate" name="毛利率" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 5, strokeWidth: 2, stroke: "#fff" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="table-wrap rounded-xl overflow-hidden border border-border-100">
                <table className="table">
                  <thead>
                    <tr>
                      <th>月份</th>
                      <th className="text-right">营业收入</th>
                      <th className="text-right">运营成本</th>
                      <th className="text-right">毛利润</th>
                      <th className="text-right">毛利率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.map((row) => (
                      <tr key={row.month}>
                        <td className="font-medium text-text-900">{row.month}</td>
                        <td className="text-right text-primary-600 font-medium">¥{row.revenue.toLocaleString()}</td>
                        <td className="text-right text-text-500">¥{row.cost.toLocaleString()}</td>
                        <td className="text-right text-success-600 font-semibold">¥{row.profit.toLocaleString()}</td>
                        <td className="text-right">
                          <span className="badge badge-success">{row.profitRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====== 库存异动日报 ====== */}
          {reportTab === "stock_daily" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-text-700 mb-1 block">统计日期</label>
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="input !py-1.5 !text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-700 mb-1 block">门店</label>
                  <select
                    className="select !py-1.5 !text-sm"
                    value={dailyStore}
                    onChange={(e) => setDailyStore(e.target.value)}
                  >
                    {storeList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-700 mb-1 block">商品分类</label>
                  <select
                    className="select !py-1.5 !text-sm"
                    value={dailyCategory}
                    onChange={(e) => setDailyCategory(e.target.value)}
                  >
                    <option value="全部">全部分类</option>
                    {categories.filter((c) => !c.parentId).map((c) => (
                      <optgroup key={c.id} label={c.name}>
                        <option value={c.id}>{c.name}（全子分类）</option>
                        {categories.filter((x) => x.parentId === c.id).map((sub) => (
                          <option key={sub.id} value={sub.id}>　{sub.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-end gap-4 flex-wrap mb-5">
                <div className="ml-auto flex items-center gap-3 flex-wrap">
                  <button
                    className="btn-outline flex items-center gap-1.5 !py-1.5 !text-sm"
                    onClick={() => {
                      if (dailySummary.list.length === 0) return alert("当日无记录可导出");
                      const header = ["时间", "异动类型", "商品", "数量", "单价依据", "金额(估)", "来源单号", "操作员", "备注"];
                      const rows = dailySummary.list.map((r: any) => {
                        const type = r.type === "transfer" ? (r.remark?.includes("入库") ? "调拨入库" : "调拨出库") : dailyTypeConfig[r.type]?.label || r.type;
                        const qtySign = r.type === "sale" || r.type === "rental_out" || r.type === "damage" ? -1 : r.type === "stocktake" ? (r.afterStock > r.beforeStock ? 1 : -1) : 1;
                        const p = products.find((x) => x.id === r.productId);
                        let amt = 0;
                        if (r.type === "sale" || r.type === "sale_return") amt = r.quantity * (p?.salePrice || 0);
                        else if (r.type === "rental_out") amt = r.quantity * (p?.rentalPrice || 0) * 3;
                        else if (r.type === "rental_in") amt = 0;
                        else amt = r.quantity * (p?.costPrice || 0);
                        return [r.createdAt, type, r.productName, qtySign * r.quantity, p?.costPrice || 0, amt, r.relatedOrderNo || "", r.operator || "", (r.remark || "").replace(/[\r\n,]/g, " ")];
                      });
                      const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
                      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `库存异动日报_${dailyDate}_${dailyStore}_${dailyCategory}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4" />导出当日CSV
                  </button>
                  <div className="text-xs text-text-500">
                    当日共 <span className="font-semibold text-text-900">{dailySummary.count}</span> 条异动记录
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "入库总数", val: dailySummary.totalIn, cls: "bg-emerald-500", dir: "+" },
                  { label: "出库总数", val: dailySummary.totalOut, cls: "bg-orange-500", dir: "-" },
                  { label: "净变动", val: dailySummary.netQty, cls: dailySummary.netQty >= 0 ? "bg-blue-500" : "bg-red-500", dir: dailySummary.netQty >= 0 ? "+" : "-" },
                  { label: "涉及金额", val: `¥${dailySummary.totalValue.toLocaleString()}`, cls: "bg-purple-500", dir: "" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`rounded-xl bg-gradient-to-br ${kpi.cls} to-${kpi.cls.replace("bg-", "")}/80 p-4 text-white`}
                  >
                    <div className="text-xs opacity-80 mb-1">{kpi.label}</div>
                    <div className="text-2xl font-bold">
                      {kpi.dir === "+" && typeof kpi.val === "number" && kpi.val > 0 ? "+" : kpi.dir === "-" ? "-" : ""}
                      {typeof kpi.val === "number" ? Math.abs(kpi.val).toLocaleString() : kpi.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border-100 bg-background-50 font-semibold text-text-900 text-sm flex items-center justify-between">
                    <div>各类型异动明细</div>
                    {selectedDailyType && (
                      <button
                        className="text-xs text-text-500 hover:text-primary-600 flex items-center gap-1"
                        onClick={() => setSelectedDailyType(null)}
                      >
                        <X className="w-3.5 h-3.5" /> 收起
                      </button>
                    )}
                  </div>
                  <div className="overflow-auto scrollbar-thin">
                    <table className="table text-sm">
                      <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr>
                          <th>异动类型</th>
                          <th className="text-right">数量</th>
                          <th className="text-right">金额影响</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailySummary.rows.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center py-12 text-text-400 text-sm">
                              当日无符合条件的异动记录
                            </td>
                          </tr>
                        )}
                        {dailySummary.rows.map((row) => (
                          <tr
                            key={row.type}
                            className={cn(
                              "hover:bg-primary-50 cursor-pointer transition-all",
                              selectedDailyType === row.type && "bg-primary-50/60 ring-1 ring-inset ring-primary-200"
                            )}
                            onClick={() =>
                              setSelectedDailyType(selectedDailyType === row.type ? null : row.type)
                            }
                          >
                            <td>
                              <span className={cn("badge", row.cfg.cls, "border")}>
                                {row.cfg.label}
                              </span>
                              <span className="ml-2 text-[11px] text-text-400">
                                {dailySummary.list.filter((r: any) => {
                                  let k = r.type;
                                  if (r.type === "transfer") k = r.remark?.includes("入库") ? "transfer_in" : "transfer_out";
                                  return k === row.type;
                                }).length} 条单据
                              </span>
                            </td>
                            <td className={cn(
                              "text-right font-bold font-mono",
                              row.qty > 0 ? "text-emerald-600" : row.qty < 0 ? "text-danger-600" : "text-text-600"
                            )}>
                              {row.qty > 0 ? "+" : ""}{row.qty.toLocaleString()}
                            </td>
                            <td className="text-right font-semibold text-text-800">
                              ¥{row.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedDailyType && (
                    <div className="border-t border-border-100 bg-background-50/40">
                      <div className="px-4 py-2 text-xs font-semibold text-text-700 flex items-center gap-2">
                        <span className={cn("badge", dailyTypeConfig[selectedDailyType]?.cls, "border")}>
                          {dailyTypeConfig[selectedDailyType]?.label} 明细单据
                        </span>
                        <span className="text-text-400">
                          共 {dailySummary.list.filter((r: any) => {
                            let k = r.type;
                            if (r.type === "transfer") k = r.remark?.includes("入库") ? "transfer_in" : "transfer_out";
                            return k === selectedDailyType;
                          }).length} 条
                        </span>
                      </div>
                      <div className="max-h-64 overflow-auto scrollbar-thin">
                        {dailySummary.list
                          .filter((r: any) => {
                            let k = r.type;
                            if (r.type === "transfer") k = r.remark?.includes("入库") ? "transfer_in" : "transfer_out";
                            return k === selectedDailyType;
                          })
                          .map((r: any) => (
                            <div
                              key={r.id}
                              className="px-4 py-2.5 border-b border-border-100 hover:bg-white transition-all flex items-center gap-3 flex-wrap"
                            >
                              <div className="text-xs text-text-500 min-w-[120px]">{r.createdAt}</div>
                              <div className="font-medium text-text-900 text-sm flex-1 min-w-[180px]">
                                {r.productName}
                                <span className="ml-2 text-text-400 font-normal">×{r.quantity}</span>
                              </div>
                              <div className="text-xs text-text-500">{r.operator}</div>
                              {r.relatedOrderNo && (
                                <button
                                  className={cn(
                                    "text-xs px-2 py-1 rounded-md border font-mono transition-all",
                                    (selectedDailyType === "sale" || selectedDailyType === "sale_return") &&
                                      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
                                    (selectedDailyType === "rental_out" || selectedDailyType === "rental_in") &&
                                      "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
                                    (selectedDailyType.startsWith("transfer") || selectedDailyType === "inbound" || selectedDailyType === "damage" || selectedDailyType === "stocktake") &&
                                      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  )}
                                  onClick={() => jumpFromReport(r.relatedOrderNo, selectedDailyType)}
                                >
                                  {r.relatedOrderNo} →
                                </button>
                              )}
                              {r.remark && (
                                <div className="text-[11px] text-text-400 max-w-[140px] truncate" title={r.remark}>
                                  {r.remark}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border-100 bg-background-50 font-semibold text-text-900 text-sm">
                    异动分布
                  </div>
                  <div className="p-5">
                    {dailySummary.rows.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={dailySummary.rows.map((r) => ({
                            name: r.cfg.label,
                            数量: Math.abs(r.qty),
                            fill: r.cfg.color,
                          }))}
                          margin={{ left: 10, right: 10, top: 10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#6B7280"
                            fontSize={11}
                            tickLine={false}
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
                            formatter={(val: number) => [val + " 件", "数量"]}
                          />
                          <Bar
                            dataKey="数量"
                            radius={[6, 6, 0, 0]}
                            barSize={28}
                          >
                            {dailySummary.rows.map((r, idx) => (
                              <Cell
                                key={idx}
                                fill={r.cfg.color}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-72 flex flex-col items-center justify-center text-text-400">
                        <Package className="w-12 h-12 mb-2 opacity-40" />
                        <div className="text-sm">暂无数据</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== 库存异常核对 ====== */}
          {reportTab === "stock_check" && (
            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "商品总数", val: stockCheckData.totalItems, sub: "SKU", cls: "from-primary-500 to-blue-500" },
                  { label: "异常商品", val: stockCheckData.mismatchCount, sub: "不一致", cls: stockCheckData.mismatchCount > 0 ? "from-danger to-danger-500" : "from-success-500 to-teal-500" },
                  { label: "差异件数", val: stockCheckData.diffQty, sub: "总差值", cls: stockCheckData.diffQty > 0 ? "from-warning to-orange-500" : "from-success-500 to-emerald-500" },
                  { label: "可租可用", val: stockCheckData.totalAvailableForRent, sub: `占用中 ${stockCheckData.occupiedTotal} 件`, cls: "from-secondary-500 to-indigo-500" },
                ].map((k, i) => (
                  <div key={i} className="card-sm p-4 flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm", k.cls)}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text-900">{k.val}</div>
                      <div className="text-xs text-text-500">{k.label} · {k.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {stockCheckData.mismatchCount > 0 && (
                <div className="rounded-xl border-2 border-danger-200 bg-danger-50/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger-600" />
                    <div className="font-semibold text-danger-800">发现 {stockCheckData.mismatchCount} 个商品账实不符！</div>
                  </div>
                  <p className="text-xs text-danger-700/80">
                    下方表格中「当前库存」列标红的商品，实际库存与按流水倒推的库存不一致，建议立即盘点或核查是否有漏记单据
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-border-100 bg-background-50 flex items-center justify-between flex-wrap gap-3">
                  <div className="font-semibold text-text-900 text-sm">库存核对表（{stockCheckData.items.length} SKU）</div>
                  <div className="flex items-center gap-3 text-xs">
                    {stockCheckData.mismatchCount > 0 && (
                      <span className="text-danger-600 font-medium">⚠️ 标红 = 账实不符</span>
                    )}
                  </div>
                </div>
                <div className="max-h-[520px] overflow-auto scrollbar-thin">
                  <table className="table text-sm">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr>
                        <th className="whitespace-nowrap">商品</th>
                        <th>分类</th>
                        <th className="text-right whitespace-nowrap">
                          <span className="text-primary-600">当前库存</span>
                        </th>
                        <th className="text-right whitespace-nowrap">流水倒推</th>
                        <th className="text-right whitespace-nowrap">累计入库</th>
                        <th className="text-right whitespace-nowrap">累计出库</th>
                        <th className="text-right whitespace-nowrap">租借占用</th>
                        <th className="text-right whitespace-nowrap">可租可售</th>
                        <th className="text-right whitespace-nowrap">差异</th>
                        <th className="text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockCheckData.items.map((d) => (
                        <tr
                          key={d.id}
                          className={cn(
                            d.isMismatch && "bg-danger-50/30 hover:bg-danger-50/60",
                            !d.isMismatch && "hover:bg-background-50"
                          )}
                        >
                          <td>
                            <div className="font-medium text-text-900 text-sm">{d.name}</div>
                            <div className="text-[11px] text-text-400 font-mono">{d.sku}</div>
                          </td>
                          <td className="text-xs text-text-600">{d.category}</td>
                          <td className="text-right">
                            <span className={cn(
                              "font-bold font-mono",
                              d.isMismatch ? "text-danger-600" : "text-primary-600"
                            )}>
                              {d.currentStock}
                            </span>
                            {d.isMismatch && <AlertTriangle className="w-3 h-3 inline ml-1 text-danger-500" />}
                          </td>
                          <td className="text-right font-mono text-text-600">{d.calcStock}</td>
                          <td className="text-right font-mono text-emerald-600">+{d.plusQty}</td>
                          <td className="text-right font-mono text-danger-600">-{d.minusQty}</td>
                          <td className="text-right">
                            {d.occupied > 0 ? (
                              <span className="badge badge-info !py-0.5">{d.occupied} 件</span>
                            ) : <span className="text-text-400">0</span>}
                          </td>
                          <td className="text-right font-semibold font-mono text-success-600">
                            {d.availableForRent}
                          </td>
                          <td className="text-right">
                            <span className={cn(
                              "font-bold font-mono",
                              d.diff !== 0 ? (d.diff > 0 ? "text-orange-600" : "text-danger-600") : "text-text-400"
                            )}>
                              {d.diff > 0 ? "+" : ""}{d.diff}
                            </span>
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <button
                              className="text-xs text-primary-600 hover:underline"
                              onClick={() => {
                                const s = useAppStore.getState();
                                s.openProductHistory(d.id, d.name);
                              }}
                            >
                              查看流水
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border-100 p-4">
                  <div className="text-xs font-semibold text-text-700 mb-2">💡 对账说明</div>
                  <ul className="text-xs text-text-500 space-y-1.5 list-disc pl-4">
                    <li><span className="text-primary-600 font-medium">当前库存</span>：商品档案中的实际库存</li>
                    <li><span className="text-text-600 font-medium">流水倒推</span>：当前库存+累计出库-累计入库</li>
                    <li><span className="text-danger-600 font-medium">差异 ≠ 0</span>：可能漏记/重复记账</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border-100 p-4">
                  <div className="text-xs font-semibold text-text-700 mb-2">🔍 排查建议</div>
                  <ul className="text-xs text-text-500 space-y-1.5 list-disc pl-4">
                    <li>点击「查看流水」逐条核对</li>
                    <li>检查销售/租借的原始订单</li>
                    <li>确认调拨单据是否全部收发</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border-100 p-4">
                  <div className="text-xs font-semibold text-text-700 mb-2">📋 处理流程</div>
                  <ul className="text-xs text-text-500 space-y-1.5 list-disc pl-4">
                    <li>确有漏记 → 补单（入库/报损）</li>
                    <li>原因不明 → 创建盘点任务</li>
                    <li>盘点确认后系统库存自动校正</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ 设置区域 ============ */}
      <div className="card-sm">
        <div className="flex items-center justify-between border-b border-border-100 px-5 py-3">
          <div className="flex gap-1">
            {[
              { key: "store", label: "门店信息", icon: Store },
              { key: "employee", label: "员工管理", icon: Users },
              { key: "supplier", label: "供应商", icon: Truck },
              { key: "tag", label: "标签管理", icon: Tags },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setSettingsTab(t.key as SettingsTab); setSearchText(""); }}
                className={`tab ${settingsTab === t.key ? "tab-active" : "tab-inactive"} flex items-center gap-1.5`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
          {settingsTab !== "store" && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-400" />
                <input
                  placeholder="搜索..."
                  className="input pl-10 w-52 text-sm py-2"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <button className="btn-primary flex items-center gap-1.5" onClick={() => openModal(settingsTab)}>
                <Plus className="w-4 h-4" />
                新增
              </button>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* ====== 门店信息 ====== */}
          {settingsTab === "store" && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="label">门店名称</label>
                    <input className="input" value={store.name} onChange={(e) => updateStore({ name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">门店编号</label>
                    <input className="input bg-background-50" value={store.code} readOnly />
                  </div>
                  <div className="col-span-2">
                    <label className="label flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 门店地址</label>
                    <input className="input" value={store.address} onChange={(e) => updateStore({ address: e.target.value })} />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 联系电话</label>
                    <input className="input" value={store.phone} onChange={(e) => updateStore({ phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> 邮箱</label>
                    <input className="input" value={store.email} onChange={(e) => updateStore({ email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">营业时间</label>
                    <input className="input" value={store.businessHours} onChange={(e) => updateStore({ businessHours: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">店长</label>
                    <input className="input" value={store.manager} onChange={(e) => updateStore({ manager: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">门店简介</label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      value={store.description || ""}
                      onChange={(e) => updateStore({ description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-3 border-t border-border-100">
                  <button className="btn-primary">保存设置</button>
                </div>
              </div>
              <div className="rounded-2xl border border-border-100 bg-gradient-to-br from-primary-50 to-secondary-50 p-5 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4 shadow-md">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div className="font-bold text-xl text-text-900 mb-1">{store.name}</div>
                <div className="text-xs text-text-500 mb-4">门店编号：{store.code}</div>
                <div className="space-y-2.5 flex-1">
                  {[
                    { icon: MapPin, text: store.address },
                    { icon: Phone, text: store.phone },
                    { icon: Mail, text: store.email },
                    { icon: Calendar, text: store.businessHours },
                    { icon: UserCheck, text: `店长：${store.manager}` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <row.icon className="w-4 h-4 text-text-400 mt-0.5 flex-shrink-0" />
                      <span className="text-text-700">{row.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/60 text-xs text-text-500 text-center">
                  员工总数 {employees.length} 人 · 在售商品 {products.length} 件
                </div>
              </div>
            </div>
          )}

          {/* ====== 员工管理 ====== */}
          {settingsTab === "employee" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div key={emp.id} className="rounded-xl border border-border-100 p-4 hover:shadow-pop transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-text-900">{emp.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {emp.role === "manager" && <Award className="w-3 h-3 text-primary-500" />}
                          <span className="text-xs text-text-500">{roleLabels[emp.role] || emp.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-secondary-50 text-text-500 hover:text-secondary-600 transition" onClick={() => openModal("employee", emp)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {emp.role !== "manager" && (
                        <button className="p-1.5 rounded-lg hover:bg-danger-50 text-text-500 hover:text-danger-600 transition" onClick={() => handleDelete("employee", emp.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-text-600">
                      <Phone className="w-3 h-3 text-text-400" /> {emp.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-text-600">
                      <Mail className="w-3 h-3 text-text-400" /> {emp.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-text-600">
                      <Calendar className="w-3 h-3 text-text-400" /> 入职 {emp.createdAt}
                    </div>
                  </div>
                  <div className={`mt-3 text-center py-1.5 rounded-lg text-xs font-medium ${
                    emp.status === "active" ? "bg-success-50 text-success-700" : "bg-background-100 text-text-500"
                  }`}>
                    {emp.status === "active" ? "● 在职" : "○ 休假中"}
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="col-span-full text-center py-12 text-text-400">暂无员工数据</div>
              )}
            </div>
          )}

          {/* ====== 供应商 ====== */}
          {settingsTab === "supplier" && (
            <div className="table-wrap rounded-xl overflow-hidden border border-border-100">
              <table className="table">
                <thead>
                  <tr>
                    <th>供应商名称</th>
                    <th>联系人</th>
                    <th>联系电话</th>
                    <th>地址</th>
                    <th>合作状态</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((sup) => (
                    <tr key={sup.id}>
                      <td className="font-medium text-text-900">{sup.name}</td>
                      <td className="text-text-700">{sup.contact}</td>
                      <td className="text-text-600 font-mono text-sm">{sup.phone}</td>
                      <td className="text-text-500 text-sm max-w-[200px] truncate">{sup.address}</td>
                      <td>
                        <span className={`badge ${sup.status === "active" ? "badge-success" : "badge-default"}`}>
                          {sup.status === "active" ? "合作中" : "已暂停"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-secondary-50 text-text-500 hover:text-secondary-600 transition" onClick={() => openModal("supplier", sup)}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-danger-50 text-text-500 hover:text-danger-600 transition" onClick={() => handleDelete("supplier", sup.id)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSuppliers.length === 0 && <div className="text-center py-12 text-text-400 text-sm">暂无数据</div>}
            </div>
          )}

          {/* ====== 标签管理 ====== */}
          {settingsTab === "tag" && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="rounded-xl border border-border-100 p-4 group hover:shadow-pop transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tag.color + "20" }}>
                      <Tags className="w-5 h-5" style={{ color: tag.color }} />
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <button className="p-1 rounded hover:bg-secondary-50 text-text-400 hover:text-secondary-600" onClick={() => openModal("tag", tag)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-danger-50 text-text-400 hover:text-danger-600" onClick={() => handleDelete("tag", tag.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-medium text-text-900 text-sm mb-1">{tag.name}</div>
                  <div className="text-xs text-text-500 mb-3">{tag.description || "-"}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md" style={{ backgroundColor: tag.color }} />
                    <span className="text-xs text-text-500 font-mono">{tag.color}</span>
                  </div>
                </div>
              ))}
              {filteredTags.length === 0 && <div className="col-span-full text-center py-12 text-text-400">暂无标签数据</div>}
            </div>
          )}
        </div>
      </div>

      {/* ============ 通用弹窗 ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in-up p-4">
          <div className="bg-white rounded-2xl shadow-pop w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-100">
              <h3 className="font-semibold text-text-900">
                {showModal.data ? "编辑" : "新增"}
                {showModal.type === "employee" && "员工"}
                {showModal.type === "supplier" && "供应商"}
                {showModal.type === "tag" && "标签"}
              </h3>
              <button onClick={() => setShowModal(null)} className="text-text-400 hover:text-text-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {showModal.type === "employee" && (
                <>
                  <div>
                    <label className="label">姓名 *</label>
                    <input className="input" value={formState.name || ""} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">角色</label>
                      <select className="select" value={formState.role || "staff"} onChange={(e) => setFormState({ ...formState, role: e.target.value })}>
                        <option value="staff">店员</option>
                        <option value="cleaner">清洗员</option>
                        <option value="manager">店长</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">状态</label>
                      <select className="select" value={formState.status || "active"} onChange={(e) => setFormState({ ...formState, status: e.target.value })}>
                        <option value="active">在职</option>
                        <option value="inactive">休假</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">手机号 *</label>
                    <input className="input" value={formState.phone || ""} onChange={(e) => setFormState({ ...formState, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">邮箱</label>
                    <input className="input" value={formState.email || ""} onChange={(e) => setFormState({ ...formState, email: e.target.value })} />
                  </div>
                </>
              )}
              {showModal.type === "supplier" && (
                <>
                  <div>
                    <label className="label">供应商名称 *</label>
                    <input className="input" value={formState.name || ""} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">联系人 *</label>
                      <input className="input" value={formState.contact || ""} onChange={(e) => setFormState({ ...formState, contact: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">电话 *</label>
                      <input className="input" value={formState.phone || ""} onChange={(e) => setFormState({ ...formState, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">地址</label>
                    <input className="input" value={formState.address || ""} onChange={(e) => setFormState({ ...formState, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">状态</label>
                    <select className="select" value={formState.status || "active"} onChange={(e) => setFormState({ ...formState, status: e.target.value })}>
                      <option value="active">合作中</option>
                      <option value="inactive">已暂停</option>
                    </select>
                  </div>
                </>
              )}
              {showModal.type === "tag" && (
                <>
                  <div>
                    <label className="label">标签名称 *</label>
                    <input className="input" value={formState.name || ""} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">标签颜色</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="w-12 h-10 rounded-lg border border-border-100 cursor-pointer" value={formState.color || "#FF6B35"} onChange={(e) => setFormState({ ...formState, color: e.target.value })} />
                      <input className="input flex-1 font-mono" value={formState.color || "#FF6B35"} onChange={(e) => setFormState({ ...formState, color: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">标签描述</label>
                    <input className="input" value={formState.description || ""} onChange={(e) => setFormState({ ...formState, description: e.target.value })} placeholder="选填，描述标签用途" />
                  </div>
                  <div>
                    <label className="label">快捷配色</label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {COLORS.map((c) => (
                        <button key={c} className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${formState.color === c ? "ring-2 ring-offset-2 ring-text-900" : ""}`} style={{ backgroundColor: c }} onClick={() => setFormState({ ...formState, color: c })} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 bg-background-50 border-t border-border-100 flex justify-end gap-3">
              <button className="btn-outline" onClick={() => setShowModal(null)}>取消</button>
              <button className="btn-primary" onClick={submitModal}>确认保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertIcon() {
  return <TrendingUp className="w-4 h-4 text-warning-500" />;
}
