import { useState } from "react";
import { useAppStore } from "@/store";
import {
  PackagePlus,
  ArrowLeftRight,
  ClipboardList,
  FileWarning,
  AlertTriangle,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Truck,
  XCircle,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "inbound", label: "入库管理", icon: PackagePlus, desc: "采购入库登记" },
  { id: "transfer", label: "调拨管理", icon: ArrowLeftRight, desc: "门店间调拨" },
  { id: "stocktake", label: "盘点管理", icon: ClipboardList, desc: "库存盘点任务" },
  { id: "damage", label: "报损管理", icon: FileWarning, desc: "商品报损登记" },
  { id: "warning", label: "预警设置", icon: AlertTriangle, desc: "安全库存预警" },
];

const typeConfig: Record<string, { label: string; icon: any; cls: string }> = {
  inbound: { label: "入库", icon: TrendingUp, cls: "bg-emerald-100 text-emerald-700" },
  transfer: { label: "调拨", icon: ArrowLeftRight, cls: "bg-blue-100 text-blue-700" },
  stocktake: { label: "盘点", icon: ClipboardList, cls: "bg-purple-100 text-purple-700" },
  damage: { label: "报损", icon: TrendingDown, cls: "bg-red-100 text-red-700" },
};

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inbound");
  const products = useAppStore((s) => s.products);
  const stockRecords = useAppStore((s) => s.stockRecords);
  const transferOrders = useAppStore((s) => s.transferOrders);
  const stocktakeOrders = useAppStore((s) => s.stocktakeOrders);
  const addStockRecord = useAppStore((s) => s.addStockRecord);
  const updateProduct = useAppStore((s) => s.updateProduct);

  const lowStockProducts = products.filter((p) => p.stock < p.safetyStock);
  const [showInbound, setShowInbound] = useState(false);
  const [inboundData, setInboundData] = useState({ productId: "", qty: 10, supplier: "", remark: "" });

  const submitInbound = () => {
    if (!inboundData.productId) return;
    const product = products.find((p) => p.id === inboundData.productId);
    if (!product) return;
    const record = {
      id: `stk${Date.now()}`,
      type: "inbound" as const,
      productId: product.id,
      productName: product.name,
      quantity: inboundData.qty,
      beforeStock: product.stock,
      afterStock: product.stock + inboundData.qty,
      relatedOrderNo: `IN${Date.now().toString().slice(-6)}`,
      operator: "店长-李明",
      remark: inboundData.remark,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    addStockRecord(record);
    updateProduct(product.id, { stock: product.stock + inboundData.qty });
    setShowInbound(false);
  };

  const active = tabs.find((t) => t.id === activeTab)!;
  const Icon = active.icon;

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">库存管理</h1>
          <p className="text-sm text-text-secondary mt-1">总库存 {products.reduce((s, p) => s + p.stock, 0)} 件 · 低库存 {lowStockProducts.length} 件</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "本月入库", val: "¥28,600", qty: "186件", cls: "from-emerald-500 to-teal-500", icon: TrendingUp },
          { label: "本月报损", val: "¥1,280", qty: "8件", cls: "from-red-500 to-rose-500", icon: TrendingDown },
          { label: "调拨中", val: "3单", qty: "35件", cls: "from-secondary-500 to-blue-500", icon: Truck },
          { label: "库存预警", val: `${lowStockProducts.length}个`, qty: "需补货", cls: "from-warning to-orange-500", icon: AlertTriangle },
        ].map((s, i) => {
          const SIcon = s.icon;
          return (
            <div key={i} className="card !p-4 flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md", s.cls)}>
                <SIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary">{s.val}</div>
                <div className="text-xs text-text-secondary">{s.label} · {s.qty}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-sm !p-2 bg-white inline-flex gap-1 self-start">
        {tabs.map((t) => {
          const TIcon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                  : "text-text-secondary hover:bg-gray-100"
              )}
            >
              <TIcon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="card flex-1 overflow-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{active.label}</h3>
              <p className="text-xs text-text-tertiary">{active.desc}</p>
            </div>
          </div>
          {(activeTab === "inbound" || activeTab === "damage" || activeTab === "stocktake") && (
            <button className="btn-primary btn-sm" onClick={() => activeTab === "inbound" && setShowInbound(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {activeTab === "inbound" && "新建入库"}
              {activeTab === "damage" && "报损登记"}
              {activeTab === "stocktake" && "创建盘点"}
            </button>
          )}
        </div>

        {activeTab === "inbound" && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>单号</th>
                  <th>类型</th>
                  <th>商品</th>
                  <th>数量</th>
                  <th>变动前</th>
                  <th>变动后</th>
                  <th>操作人</th>
                  <th>备注</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {stockRecords.filter((r) => r.type === "inbound").map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs">{r.relatedOrderNo}</td>
                    <td><span className={cn("badge", typeConfig[r.type].cls)}>{typeConfig[r.type].label}</span></td>
                    <td className="font-medium">{r.productName}</td>
                    <td className="text-emerald-600 font-bold">+{r.quantity}</td>
                    <td>{r.beforeStock}</td>
                    <td>{r.afterStock}</td>
                    <td>{r.operator}</td>
                    <td className="text-text-tertiary max-w-40 truncate">{r.remark}</td>
                    <td className="text-text-tertiary text-xs">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "transfer" && (
          <div className="space-y-3">
            {transferOrders.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border-2 border-border hover:border-secondary-300 transition-all bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-secondary-700 bg-secondary-50 px-3 py-1 rounded-lg">{t.orderNo}</span>
                    <span
                      className={cn("badge",
                        t.status === "pending" && "bg-orange-100 text-orange-700",
                        t.status === "shipped" && "bg-blue-100 text-blue-700",
                        t.status === "received" && "bg-emerald-100 text-emerald-700",
                      )}
                    >
                      {t.status === "pending" && "待发货"}
                      {t.status === "shipped" && "运输中"}
                      {t.status === "received" && "已收货"}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">{t.createdAt}</span>
                </div>
                <div className="flex items-center gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">{t.fromStore.slice(0, 2)}</div>
                    <span className="font-medium">{t.fromStore}</span>
                  </div>
                  <ArrowLeftRight className="w-4 h-4 text-text-tertiary" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.toStore}</span>
                    <div className="w-7 h-7 rounded-lg bg-secondary-100 flex items-center justify-center text-xs font-bold text-secondary-700">{t.toStore.slice(0, 2)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.items.map((it) => (
                    <span key={it.productId} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-text-secondary">
                      {it.productName} × {it.quantity}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">操作人：{t.operator}</span>
                  {t.status === "pending" && <button className="btn-primary btn-sm"><Truck className="w-3.5 h-3.5 mr-1.5" />发货</button>}
                  {t.status === "shipped" && <button className="btn-secondary btn-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />确认收货</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "stocktake" && (
          <div className="space-y-3">
            {stocktakeOrders.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border-2 border-border bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{s.name}</span>
                      <span className="font-mono text-xs text-text-tertiary">{s.orderNo}</span>
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">{s.createdAt} · {s.operator}</div>
                  </div>
                  <span className={cn("badge", s.status === "draft" ? "bg-gray-100 text-gray-700" : "bg-emerald-100 text-emerald-700")}>
                    {s.status === "draft" ? "草稿" : "已确认"}
                  </span>
                </div>
                <div className="table-wrap">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>商品</th>
                        <th className="text-right">系统库存</th>
                        <th className="text-right">实盘数</th>
                        <th className="text-right">差异</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.items.map((it) => (
                        <tr key={it.productId}>
                          <td>{it.productName}</td>
                          <td className="text-right">{it.systemStock}</td>
                          <td className="text-right">{it.actualStock}</td>
                          <td className={cn("text-right font-bold",
                            it.diff < 0 ? "text-danger" : it.diff > 0 ? "text-emerald-600" : "text-text-tertiary"
                          )}>
                            {it.diff > 0 ? "+" : ""}{it.diff}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "damage" && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>单号</th>
                  <th>商品</th>
                  <th>报损数量</th>
                  <th>变动前</th>
                  <th>变动后</th>
                  <th>报损原因</th>
                  <th>操作人</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {stockRecords.filter((r) => r.type === "damage").map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs">{r.relatedOrderNo}</td>
                    <td className="font-medium">{r.productName}</td>
                    <td className="text-danger font-bold">-{r.quantity}</td>
                    <td>{r.beforeStock}</td>
                    <td>{r.afterStock}</td>
                    <td className="text-text-tertiary">{r.remark}</td>
                    <td>{r.operator}</td>
                    <td className="text-text-tertiary text-xs">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "warning" && (
          <div>
            <div className="p-4 mb-5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-semibold text-orange-800">
                  以下商品库存低于安全阈值，请及时补货
                </span>
              </div>
              <div className="text-xs text-orange-700">共 {lowStockProducts.length} 个商品需要关注</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-white hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={p.imageUrl} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary truncate">{p.name}</div>
                      <div className="text-xs text-text-tertiary">{p.categoryName} · {p.ageRange}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs text-text-tertiary">当前库存</span>
                      <div className="text-xl font-bold text-danger">{p.stock}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-text-tertiary">安全库存</span>
                      <div className="text-lg font-semibold text-text-secondary">{p.safetyStock}</div>
                    </div>
                    <div className="w-24">
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-danger to-orange-400 rounded-full" style={{ width: `${Math.min(100, (p.stock / p.safetyStock) * 100)}%` }}></div>
                      </div>
                      <div className="text-[10px] text-right mt-1 text-danger font-medium">缺口 {p.safetyStock - p.stock}</div>
                    </div>
                  </div>
                  <button className="w-full btn-primary btn-sm">立即补货</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showInbound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40" onClick={() => setShowInbound(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-pop p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-600" /> 新建入库单
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">选择商品 *</label>
                <select className="select" value={inboundData.productId} onChange={(e) => setInboundData({ ...inboundData, productId: e.target.value })}>
                  <option value="">请选择商品</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (库存: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="label">入库数量</label>
                <input type="number" className="input" value={inboundData.qty} onChange={(e) => setInboundData({ ...inboundData, qty: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">供应商</label>
                <select className="select" value={inboundData.supplier} onChange={(e) => setInboundData({ ...inboundData, supplier: e.target.value })}>
                  <option>请选择</option>
                  {useAppStore.getState().suppliers.map((s) => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">备注</label>
                <input className="input" value={inboundData.remark} onChange={(e) => setInboundData({ ...inboundData, remark: e.target.value })} placeholder="选填" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-outline" onClick={() => setShowInbound(false)}>取消</button>
              <button className="btn-primary" onClick={submitInbound}>确认入库</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
