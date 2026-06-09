import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import {
  X,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ClipboardList,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { label: string; icon: any; cls: string; dir: "+" | "-" | "±"; page?: "inventory" | "sales" | "rental"; tab?: string }
> = {
  inbound: { label: "入库", icon: TrendingUp, cls: "bg-emerald-100 text-emerald-700", dir: "+", page: "inventory", tab: "inbound" },
  transfer: { label: "调拨", icon: ArrowLeftRight, cls: "bg-blue-100 text-blue-700", dir: "±", page: "inventory", tab: "transfer" },
  stocktake: { label: "盘点", icon: ClipboardList, cls: "bg-purple-100 text-purple-700", dir: "±", page: "inventory", tab: "stocktake" },
  damage: { label: "报损", icon: TrendingDown, cls: "bg-red-100 text-red-700", dir: "-", page: "inventory", tab: "damage" },
  rental_out: { label: "租出", icon: Package, cls: "bg-indigo-100 text-indigo-700", dir: "-", page: "rental" },
  rental_in: { label: "归还", icon: Package, cls: "bg-cyan-100 text-cyan-700", dir: "+", page: "rental" },
  sale: { label: "销售", icon: Package, cls: "bg-orange-100 text-orange-700", dir: "-", page: "sales" },
  sale_return: { label: "退货", icon: Package, cls: "bg-pink-100 text-pink-700", dir: "+", page: "sales" },
};

const typeList = Object.keys(typeConfig);

const timePresets = [
  { id: "all", label: "全部", range: [null, null] as [string | null, string | null] },
  { id: "today", label: "今日", range: [new Date().toISOString().slice(0, 10), null] },
  { id: "7d", label: "近7天", range: [new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), null] },
  { id: "30d", label: "近30天", range: [new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), null] },
];

export default function ProductHistoryModal() {
  const navigate = useNavigate();
  const {
    productHistory,
    closeProductHistory,
    stockRecords,
    products,
    setOrderFocus,
  } = useAppStore();

  const [filterType, setFilterType] = useState<string[]>([]);
  const [timePreset, setTimePreset] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [orderKeyword, setOrderKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(true);

  const toggleType = (t: string) => {
    setFilterType((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const clearFilters = () => {
    setFilterType([]);
    setTimePreset("all");
    setStartDate("");
    setEndDate("");
    setOrderKeyword("");
  };

  const records = useMemo(() => {
    if (!productHistory) return [];
    let list = stockRecords
      .filter((r) => r.productId === productHistory.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filterType.length > 0) list = list.filter((r) => filterType.includes(r.type));
    if (orderKeyword.trim()) {
      const kw = orderKeyword.trim().toLowerCase();
      list = list.filter((r) => r.relatedOrderNo.toLowerCase().includes(kw));
    }
    let effStart: string | null = null;
    let effEnd: string | null = null;
    if (timePreset !== "custom") {
      const preset = timePresets.find((p) => p.id === timePreset);
      effStart = preset?.range?.[0] || null;
    } else {
      effStart = startDate || null;
      effEnd = endDate || null;
    }
    if (effStart) list = list.filter((r) => r.createdAt.slice(0, 10) >= effStart!);
    if (effEnd) list = list.filter((r) => r.createdAt.slice(0, 10) <= effEnd!);

    return list;
  }, [stockRecords, productHistory, filterType, orderKeyword, timePreset, startDate, endDate]);

  const typeStats = useMemo(() => {
    if (!productHistory) return [];
    const stats: Record<string, number> = {};
    stockRecords
      .filter((r) => r.productId === productHistory.id)
      .forEach((r) => {
        stats[r.type] = (stats[r.type] || 0) + 1;
      });
    return typeList
      .filter((t) => stats[t])
      .map((t) => ({ type: t, count: stats[t], ...typeConfig[t] }));
  }, [stockRecords, productHistory]);

  const jumpToOrder = (record: any) => {
    const cfg = typeConfig[record.type];
    if (!cfg?.page) return;
    const tab = cfg.tab || undefined;
    setOrderFocus({ orderNo: record.relatedOrderNo, page: cfg.page, tab });
    closeProductHistory();
    setTimeout(() => {
      navigate(cfg.page === "inventory" ? "/inventory" : cfg.page === "sales" ? "/sales" : "/rental");
    }, 30);
  };

  if (!productHistory) return null;

  const p = products.find((x) => x.id === productHistory.id);
  const currentStock = p?.stock ?? 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border-100 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-lg font-bold text-text-900 flex items-center gap-2">
              📋 库存流水明细
              {p && <span className="text-primary-600">「{p.name}」</span>}
            </div>
            <div className="text-xs text-text-500 mt-0.5">
              共 {stockRecords.filter((r) => r.productId === productHistory.id).length} 条记录，
              当前筛选 {records.length} 条
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-lg hover:bg-background-50 flex items-center justify-center text-text-500 hover:text-text-900"
            onClick={closeProductHistory}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin flex flex-col min-h-0">
          {p && (
            <div className="px-6 pt-5 flex-shrink-0">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 flex items-center gap-4">
                <img
                  src={p.imageUrl}
                  className="w-16 h-16 rounded-lg object-cover border border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-text-900 truncate">{p.name}</div>
                  <div className="text-xs text-text-500 mt-0.5">
                    {p.categoryName} · {p.ageRange} · 条码 {p.barcode} · SKU {p.sku}
                  </div>
                  {typeStats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {typeStats.map((s) => (
                        <span key={s.type} className={cn("badge !text-[11px]", s.cls)}>
                          {s.label} {s.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-text-500">当前库存</div>
                  <div className="text-2xl font-bold text-primary-600">{currentStock}</div>
                  <div className="text-[10px] text-text-400 mt-0.5">安全库存 {p.safetyStock}</div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "btn-sm btn-outline flex items-center gap-1.5",
                    showFilter && "bg-secondary-50 ring-2 ring-secondary-300"
                  )}
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter className="w-4 h-4" />
                  筛选
                  {showFilter ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {(filterType.length > 0 || orderKeyword || startDate || endDate || timePreset !== "all") && (
                  <button className="btn-sm btn-outline text-danger hover:bg-danger-50" onClick={clearFilters}>
                    清除筛选
                  </button>
                )}
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-400" />
                <input
                  className="input pl-9 py-1.5 !text-sm"
                  placeholder="搜索来源单号..."
                  value={orderKeyword}
                  onChange={(e) => setOrderKeyword(e.target.value)}
                />
              </div>
            </div>

            {showFilter && (
              <div className="rounded-xl border border-border-100 p-4 bg-background-50/50 space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-text-700 mb-2 block">流水类型</label>
                  <div className="flex flex-wrap gap-2">
                    {typeList.map((t) => {
                      const cfg = typeConfig[t];
                      const CfgIcon = cfg.icon;
                      const active = filterType.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleType(t)}
                          className={cn(
                            "badge cursor-pointer transition-all",
                            active ? cfg.cls + " ring-2 ring-offset-1 ring-current scale-105" : "bg-white text-text-500 hover:text-text-800 border border-border-100"
                          )}
                        >
                          <CfgIcon className="w-3 h-3 mr-1 inline" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-700 mb-2 block">时间范围</label>
                    <div className="flex flex-wrap gap-2">
                      {timePresets.map((tp) => (
                        <button
                          key={tp.id}
                          onClick={() => {
                            setTimePreset(tp.id);
                            setStartDate("");
                            setEndDate("");
                          }}
                          className={cn(
                            "badge cursor-pointer",
                            timePreset === tp.id
                              ? "bg-primary-100 text-primary-700 ring-2 ring-primary-300"
                              : "bg-white text-text-500 hover:text-text-800 border border-border-100"
                          )}
                        >
                          <Calendar className="w-3 h-3 mr-1 inline" />
                          {tp.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setTimePreset("custom")}
                        className={cn(
                          "badge cursor-pointer",
                          timePreset === "custom"
                            ? "bg-primary-100 text-primary-700 ring-2 ring-primary-300"
                            : "bg-white text-text-500 hover:text-text-800 border border-border-100"
                        )}
                      >
                        自定义
                      </button>
                    </div>
                  </div>
                  {timePreset === "custom" && (
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-text-700 mb-2 block">开始日期</label>
                        <input
                          type="date"
                          className="input !py-1.5 !text-sm"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-text-700 mb-2 block">结束日期</label>
                        <input
                          type="date"
                          className="input !py-1.5 !text-sm"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-3 flex-1 min-h-0">
            <div className="rounded-xl border border-border-100 overflow-hidden h-full flex flex-col">
              <table className="table text-sm flex-shrink-0">
                <thead className="bg-white shadow-sm sticky top-0 z-10">
                  <tr>
                    <th>来源单号</th>
                    <th>类型</th>
                    <th>变动数</th>
                    <th className="text-right">变动前</th>
                    <th className="text-right">变动后</th>
                    <th>操作人</th>
                    <th>备注</th>
                    <th className="text-right">时间</th>
                  </tr>
                </thead>
              </table>
              <div className="flex-1 overflow-auto scrollbar-thin">
                <table className="table text-sm">
                  <tbody>
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-16 text-text-400">
                          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <div className="text-sm">暂无匹配的流水记录</div>
                          <div className="text-xs mt-1 opacity-70">尝试调整筛选条件</div>
                        </td>
                      </tr>
                    )}
                    {records.map((r) => {
                      const cfg = typeConfig[r.type] || typeConfig.inbound;
                      const CfgIcon = cfg.icon;
                      const dir = cfg.dir;
                      const qtySign =
                        dir === "+"
                          ? "+"
                          : dir === "-"
                          ? "-"
                          : r.type === "transfer"
                          ? r.remark?.includes("入库")
                            ? "+"
                            : "-"
                          : r.type === "stocktake"
                          ? r.afterStock > r.beforeStock
                            ? "+"
                            : r.afterStock < r.beforeStock
                            ? "-"
                            : ""
                          : "";
                      const qtyColor =
                        qtySign === "+"
                          ? "text-emerald-600"
                          : qtySign === "-"
                          ? "text-danger-600"
                          : "text-secondary-600";
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-primary-50/40 transition-colors group"
                        >
                          <td className="font-mono text-xs">
                            <button
                              onClick={() => jumpToOrder(r)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all",
                                cfg.page
                                  ? "hover:bg-primary-100 text-primary-700 hover:underline"
                                  : "text-text-700"
                              )}
                            >
                              {r.relatedOrderNo}
                              {cfg.page && (
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </td>
                          <td>
                            <span className={cn("badge", cfg.cls)}>
                              <CfgIcon className="w-3 h-3 inline mr-1" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className={cn("font-bold font-mono", qtyColor)}>
                            {qtySign}
                            {r.quantity}
                          </td>
                          <td className="text-right font-mono text-text-600">{r.beforeStock}</td>
                          <td className="text-right font-mono text-text-900 font-semibold">
                            {r.afterStock}
                          </td>
                          <td className="text-text-600">{r.operator}</td>
                          <td className="text-xs text-text-500">
                            <div
                              className="max-w-xs truncate"
                              title={r.remark || ""}
                            >
                              {r.remark || "-"}
                            </div>
                          </td>
                          <td className="text-right font-mono text-xs text-text-500 whitespace-nowrap">
                            {r.createdAt}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-border-100 flex items-center justify-between flex-shrink-0 bg-background-50/50">
          <div className="text-xs text-text-500">
            💡 点击单号可跳转到对应订单位置（销售/租借/调拨）
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline btn-sm" onClick={clearFilters}>
              重置筛选
            </button>
            <button className="btn-primary btn-sm" onClick={closeProductHistory}>
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
