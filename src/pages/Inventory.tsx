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
  X,
  Package,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "inbound", label: "入库管理", icon: PackagePlus, desc: "采购入库登记" },
  { id: "transfer", label: "调拨管理", icon: ArrowLeftRight, desc: "门店间调拨" },
  { id: "stocktake", label: "盘点管理", icon: ClipboardList, desc: "库存盘点任务" },
  { id: "damage", label: "报损管理", icon: FileWarning, desc: "商品报损登记" },
  { id: "warning", label: "预警设置", icon: AlertTriangle, desc: "安全库存预警" },
];

const typeConfig: Record<string, { label: string; icon: any; cls: string; dir: "+" | "-" | "±" }> = {
  inbound: { label: "入库", icon: TrendingUp, cls: "bg-emerald-100 text-emerald-700", dir: "+" },
  transfer: { label: "调拨", icon: ArrowLeftRight, cls: "bg-blue-100 text-blue-700", dir: "±" },
  stocktake: { label: "盘点", icon: ClipboardList, cls: "bg-purple-100 text-purple-700", dir: "±" },
  damage: { label: "报损", icon: TrendingDown, cls: "bg-red-100 text-red-700", dir: "-" },
  rental_out: { label: "租出", icon: Package, cls: "bg-indigo-100 text-indigo-700", dir: "-" },
  rental_in: { label: "归还", icon: Package, cls: "bg-cyan-100 text-cyan-700", dir: "+" },
  sale: { label: "销售", icon: Package, cls: "bg-orange-100 text-orange-700", dir: "-" },
  sale_return: { label: "退货", icon: Package, cls: "bg-pink-100 text-pink-700", dir: "+" },
};

const storeList = ["海淀店", "朝阳店", "中关村店", "西城店"];

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inbound");
  const {
    products,
    stockRecords,
    transferOrders,
    stocktakeOrders,
    addStockRecord,
    updateProduct,
    addTransfer,
    updateTransfer,
    addStocktake,
    suppliers,
  } = useAppStore();

  const lowStockProducts = products.filter((p) => p.stock < p.safetyStock);

  // 入库
  const [showInbound, setShowInbound] = useState(false);
  const [inboundData, setInboundData] = useState({ productId: "", qty: 10, supplier: "", remark: "" });

  // 报损
  const [showDamage, setShowDamage] = useState(false);
  const [damageData, setDamageData] = useState({ productId: "", qty: 1, reason: "", remark: "" });

  // 调拨新建
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState<{
    fromStore: string;
    toStore: string;
    items: { productId: string; productName: string; quantity: number }[];
  }>({
    fromStore: "海淀店",
    toStore: "朝阳店",
    items: [],
  });

  // 商品流水明细弹窗
  const [showProductHistory, setShowProductHistory] = useState<{ id: string; name: string } | null>(null);

  // 盘点
  const [showStocktake, setShowStocktake] = useState(false);
  const [stocktakeName, setStocktakeName] = useState("");
  const [stocktakeItems, setStocktakeItems] = useState<
    { productId: string; productName: string; systemStock: number; actualStock: number }[]
  >([]);

  const submitInbound = () => {
    if (!inboundData.productId) return;
    const product = products.find((p) => p.id === inboundData.productId);
    if (!product) return;
    const qty = Math.max(1, inboundData.qty);
    addStockRecord({
      id: `stk${Date.now()}`,
      type: "inbound",
      productId: product.id,
      productName: product.name,
      quantity: qty,
      beforeStock: product.stock,
      afterStock: product.stock + qty,
      relatedOrderNo: `IN${Date.now().toString().slice(-6)}`,
      operator: "店长-李明",
      remark: inboundData.supplier ? `供应商:${inboundData.supplier} · ${inboundData.remark}` : inboundData.remark,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    updateProduct(product.id, { stock: product.stock + qty });
    setShowInbound(false);
    setInboundData({ productId: "", qty: 10, supplier: "", remark: "" });
  };

  const submitDamage = () => {
    if (!damageData.productId) return alert("请选择商品");
    const product = products.find((p) => p.id === damageData.productId);
    if (!product) return;
    if (product.stock <= 0) return alert(`商品「${product.name}」当前库存为 0，无法报损`);
    const qty = Math.max(1, Math.min(damageData.qty, product.stock));
    if (qty <= 0) return alert("报损数量无效");
    addStockRecord({
      id: `stk${Date.now()}`,
      type: "damage",
      productId: product.id,
      productName: product.name,
      quantity: qty,
      beforeStock: product.stock,
      afterStock: Math.max(0, product.stock - qty),
      relatedOrderNo: `DM${Date.now().toString().slice(-6)}`,
      operator: "店长-李明",
      remark: damageData.reason ? `${damageData.reason} · ${damageData.remark}` : damageData.remark,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    updateProduct(product.id, { stock: Math.max(0, product.stock - qty) });
    setShowDamage(false);
    setDamageData({ productId: "", qty: 1, reason: "", remark: "" });
  };

  const addStocktakeItem = () => {
    const existing = new Set(stocktakeItems.map((i) => i.productId));
    const candidates = products.filter((p) => !existing.has(p.id));
    if (candidates.length === 0) return;
    const p = candidates[0];
    setStocktakeItems([
      ...stocktakeItems,
      { productId: p.id, productName: p.name, systemStock: p.stock, actualStock: p.stock },
    ]);
  };

  const removeStocktakeItem = (pid: string) => {
    setStocktakeItems(stocktakeItems.filter((i) => i.productId !== pid));
  };

  const updateStocktakeActual = (pid: string, actual: number) => {
    setStocktakeItems(
      stocktakeItems.map((i) => (i.productId === pid ? { ...i, actualStock: Math.max(0, actual) } : i))
    );
  };

  const submitStocktake = (confirm: boolean) => {
    if (!stocktakeName.trim() || stocktakeItems.length === 0) return;
    const items = stocktakeItems.map((i) => ({ ...i, diff: i.actualStock - i.systemStock }));
    addStocktake({
      id: `sk${Date.now()}`,
      orderNo: `SK${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 90) + 10)}`,
      name: stocktakeName.trim(),
      items,
      status: confirm ? "confirmed" : "draft",
      operator: "店长-李明",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    if (confirm) {
      items.forEach((it) => {
        if (it.diff !== 0) {
          const p = products.find((x) => x.id === it.productId);
          if (p) {
            addStockRecord({
              id: `stk${Date.now()}-${it.productId}`,
              type: "stocktake",
              productId: it.productId,
              productName: it.productName,
              quantity: Math.abs(it.diff),
              beforeStock: it.systemStock,
              afterStock: it.actualStock,
              relatedOrderNo: `SK${Date.now().toString().slice(-6)}`,
              operator: "店长-李明",
              remark: it.diff > 0 ? "盘盈" : "盘亏",
              createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            });
            updateProduct(it.productId, { stock: it.actualStock });
          }
        }
      });
    }
    setShowStocktake(false);
    setStocktakeName("");
    setStocktakeItems([]);
  };

  const shipTransfer = (tid: string) => {
    const t = transferOrders.find((x) => x.id === tid);
    if (!t || t.status !== "pending") return;

    const lacks: string[] = [];
    const shippedItems = t.items.map((it) => {
      const p = products.find((x) => x.id === it.productId);
      const stock = p?.stock || 0;
      const shippedQty = Math.min(it.quantity, stock);
      if (shippedQty < it.quantity) {
        lacks.push(`· ${it.productName}：申请 ${it.quantity}，可发 ${shippedQty}，缺 ${it.quantity - shippedQty}`);
      }
      return { ...it, shippedQuantity: shippedQty };
    });
    if (lacks.length > 0) {
      alert(`⚠️ 以下商品库存不足，无法继续发货：\n\n${lacks.join("\n")}`);
      return;
    }
    shippedItems.forEach((it) => {
      const p = products.find((x) => x.id === it.productId);
      if (p && it.shippedQuantity && it.shippedQuantity > 0) {
        addStockRecord({
          id: `stk${Date.now()}-${it.productId}`,
          type: "transfer",
          productId: it.productId,
          productName: it.productName,
          quantity: it.shippedQuantity,
          beforeStock: p.stock,
          afterStock: p.stock - it.shippedQuantity,
          relatedOrderNo: t.orderNo,
          operator: "店长-李明",
          remark: `调拨出库至${t.toStore}`,
          createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        });
        updateProduct(it.productId, { stock: Math.max(0, p.stock - it.shippedQuantity) });
      }
    });
    updateTransfer(tid, { status: "shipped", items: shippedItems });
  };

  const receiveTransfer = (tid: string) => {
    const t = transferOrders.find((x) => x.id === tid);
    if (!t || t.status !== "shipped") return;
    t.items.forEach((it) => {
      const shippedQty = it.shippedQuantity ?? it.quantity;
      if (shippedQty > 0) {
        const p = products.find((x) => x.id === it.productId);
        if (p) {
          addStockRecord({
            id: `stk${Date.now()}-${it.productId}`,
            type: "transfer",
            productId: it.productId,
            productName: it.productName,
            quantity: shippedQty,
            beforeStock: p.stock,
            afterStock: p.stock + shippedQty,
            relatedOrderNo: t.orderNo,
            operator: "店长-李明",
            remark: `调拨入库从${t.fromStore}`,
            createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          });
          updateProduct(it.productId, { stock: p.stock + shippedQty });
        }
      }
    });
    updateTransfer(tid, { status: "received" });
  };

  // ===== 调拨新建辅助函数 =====
  const addTransferItem = () => {
    const existIds = new Set(transferForm.items.map((x) => x.productId));
    const candidates = products.filter((p) => !existIds.has(p.id));
    if (candidates.length === 0) return;
    const p = candidates[0];
    setTransferForm({
      ...transferForm,
      items: [...transferForm.items, { productId: p.id, productName: p.name, quantity: 1 }],
    });
  };

  const removeTransferItem = (pid: string) => {
    setTransferForm({ ...transferForm, items: transferForm.items.filter((x) => x.productId !== pid) });
  };

  const changeTransferItem = (pid: string, key: "productId" | "quantity", val: any) => {
    setTransferForm({
      ...transferForm,
      items: transferForm.items.map((x) => {
        if (x.productId !== pid) return x;
        if (key === "productId") {
          const np = products.find((p) => p.id === val);
          return { productId: val, productName: np?.name || "", quantity: x.quantity };
        }
        return { ...x, quantity: Math.max(1, Number(val) || 0) };
      }),
    });
  };

  const submitTransferCreate = () => {
    if (transferForm.fromStore === transferForm.toStore) return alert("调出门店和调入门店不能相同");
    if (transferForm.items.length === 0) return alert("请至少添加一件商品");
    const invalid = transferForm.items.find((x) => !x.productId || x.quantity <= 0);
    if (invalid) return alert("存在无效的商品行，请检查");
    const date = new Date();
    const orderNo = `TR${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 900) + 100)}`;
    addTransfer({
      id: `tr${Date.now()}`,
      orderNo,
      fromStore: transferForm.fromStore,
      toStore: transferForm.toStore,
      items: transferForm.items,
      status: "pending",
      operator: "店长-李明",
      createdAt: date.toISOString().slice(0, 16).replace("T", " "),
    });
    setShowTransfer(false);
    setTransferForm({ fromStore: "海淀店", toStore: "朝阳店", items: [] });
  };

  const active = tabs.find((t) => t.id === activeTab)!;
  const Icon = active.icon;

  const todayDamageQty = stockRecords
    .filter((r) => r.type === "damage")
    .reduce((s, r) => s + r.quantity, 0);
  const todayInboundQty = stockRecords
    .filter((r) => r.type === "inbound")
    .reduce((s, r) => s + r.quantity, 0);
  const pendingTransferQty = transferOrders.filter((t) => t.status !== "received").length;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-900">库存管理</h1>
          <p className="text-sm text-text-500 mt-1">
            总库存 {products.reduce((s, p) => s + p.stock, 0)} 件 · 低库存 {lowStockProducts.length} 件
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "累计入库", val: todayInboundQty + "件", qty: "记录 " + stockRecords.filter(r => r.type === "inbound").length, cls: "from-emerald-500 to-teal-500", icon: TrendingUp },
          { label: "累计报损", val: todayDamageQty + "件", qty: "金额 ¥" + (todayDamageQty * 120), cls: "from-danger to-danger-500", icon: TrendingDown },
          { label: "调拨中", val: pendingTransferQty + "单", qty: "运输中 " + transferOrders.filter(t => t.status === "shipped").length, cls: "from-secondary-500 to-blue-500", icon: Truck },
          { label: "库存预警", val: lowStockProducts.length + "个", qty: "需补货", cls: "from-warning to-orange-500", icon: AlertTriangle },
        ].map((s, i) => {
          const SIcon = s.icon;
          return (
            <div key={i} className="card-sm p-4 flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm", s.cls)}>
                <SIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-900">{s.val}</div>
                <div className="text-xs text-text-500">{s.label} · {s.qty}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-sm p-2 bg-white inline-flex gap-1 self-start">
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
                  : "text-text-500 hover:bg-background-50"
              )}
            >
              <TIcon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="card-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-900">{active.label}</h3>
              <p className="text-xs text-text-500">{active.desc}</p>
            </div>
          </div>
          {(activeTab === "inbound" || activeTab === "damage" || activeTab === "stocktake" || activeTab === "transfer") && (
            <button
              className="btn-primary flex items-center gap-1.5"
              onClick={() => {
                if (activeTab === "inbound") setShowInbound(true);
                if (activeTab === "damage") setShowDamage(true);
                if (activeTab === "stocktake") setShowStocktake(true);
                if (activeTab === "transfer") setShowTransfer(true);
              }}
            >
              <Plus className="w-4 h-4" />
              {activeTab === "inbound" && "新建入库"}
              {activeTab === "damage" && "报损登记"}
              {activeTab === "stocktake" && "创建盘点"}
              {activeTab === "transfer" && "新建调拨"}
            </button>
          )}
        </div>

        {/* ============ 入库 ============ */}
        {activeTab === "inbound" && (
          <div className="table-wrap rounded-xl border border-border-100 overflow-hidden">
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
                    <td className="font-mono text-xs text-text-700">{r.relatedOrderNo}</td>
                    <td><span className={cn("badge", typeConfig[r.type].cls)}>{typeConfig[r.type].label}</span></td>
                    <td
                      className="font-medium text-text-900 cursor-pointer hover:text-primary-600 hover:underline"
                      onClick={() => setShowProductHistory({ id: r.productId, name: r.productName })}
                    >{r.productName}</td>
                    <td className="text-emerald-600 font-bold">+{r.quantity}</td>
                    <td>{r.beforeStock}</td>
                    <td>{r.afterStock}</td>
                    <td>{r.operator}</td>
                    <td className="text-text-500 max-w-48 truncate">{r.remark}</td>
                    <td className="text-text-500 text-xs">{r.createdAt}</td>
                  </tr>
                ))}
                {stockRecords.filter((r) => r.type === "inbound").length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-text-400">暂无入库记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ============ 调拨 ============ */}
        {activeTab === "transfer" && (
          <div className="space-y-3">
            {transferOrders.length === 0 && <div className="text-center py-10 text-text-400">暂无调拨单</div>}
            {transferOrders.map((t) => (
              <div key={t.id} className={cn(
                "p-5 rounded-xl border transition-all bg-white",
                t.status === "received" ? "border-success-200 bg-success-50/30" :
                t.status === "shipped" ? "border-secondary-200 bg-secondary-50/30" :
                "border-warning-200 bg-warning-50/30"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-semibold text-secondary-700 bg-secondary-50 px-3 py-1.5 rounded-lg">{t.orderNo}</span>
                    <span className={cn(
                      "badge",
                      t.status === "pending" && "badge-warning",
                      t.status === "shipped" && "badge-info",
                      t.status === "received" && "badge-success",
                    )}>
                      {t.status === "pending" && "待发货"}
                      {t.status === "shipped" && "运输中"}
                      {t.status === "received" && "已收货"}
                    </span>
                  </div>
                  <span className="text-xs text-text-500">{t.createdAt}</span>
                </div>
                <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">{t.fromStore.slice(0, 2)}</div>
                    <span className="font-medium text-text-900">{t.fromStore}</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-background-50">
                    <Truck className="w-3.5 h-3.5 text-text-400" />
                    <ArrowLeftRight className="w-4 h-4 text-text-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-900">{t.toStore}</span>
                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center text-xs font-bold text-secondary-700">{t.toStore.slice(0, 2)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {t.items.map((it) => (
                    <span
                      key={it.productId}
                      className="px-3 py-1.5 bg-background-50 border border-border-100 rounded-lg text-xs text-text-700 cursor-pointer hover:border-primary-300 hover:bg-primary-50"
                      onClick={() => setShowProductHistory({ id: it.productId, name: it.productName })}
                      title="点击查看商品流水"
                    >
                      <Package className="w-3 h-3 inline mr-1" />
                      {it.productName} × <span className="font-semibold text-primary-600">
                        {it.shippedQuantity != null ? `${it.shippedQuantity}/${it.quantity}` : it.quantity}
                      </span>
                      {it.shippedQuantity != null && t.status !== "pending" && (
                        <span className="ml-1 text-text-400 text-[10px]">
                          {t.status === "shipped" ? "已发" : "实发"}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-4 border-t border-border-100 flex items-center justify-between">
                  <span className="text-xs text-text-500">操作人：{t.operator}</span>
                  <div className="flex gap-2">
                    {t.status === "pending" && (
                      <button className="btn-primary flex items-center gap-1.5" onClick={() => shipTransfer(t.id)}>
                        <Truck className="w-4 h-4" />确认发货
                      </button>
                    )}
                    {t.status === "shipped" && (
                      <button className="btn-secondary flex items-center gap-1.5" onClick={() => receiveTransfer(t.id)}>
                        <CheckCircle2 className="w-4 h-4" />确认收货
                      </button>
                    )}
                    {t.status === "received" && (
                      <span className="flex items-center gap-1 text-success-600 text-sm font-medium px-3 py-1.5 bg-success-50 rounded-lg">
                        <FileCheck className="w-4 h-4" />调拨完成
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ 盘点 ============ */}
        {activeTab === "stocktake" && (
          <div className="space-y-3">
            {stocktakeOrders.length === 0 && <div className="text-center py-10 text-text-400">暂无盘点任务</div>}
            {stocktakeOrders.map((s) => {
              const diff = s.items.reduce((sum, it) => sum + Math.abs(it.diff), 0);
              const profit = s.items.reduce((sum, it) => sum + it.diff, 0);
              return (
                <div key={s.id} className="p-5 rounded-xl border-2 border-border-100 bg-white transition-all hover:border-primary-200">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-text-900 text-base">{s.name}</span>
                        <span className="font-mono text-xs text-text-500 bg-background-50 px-2 py-1 rounded">{s.orderNo}</span>
                      </div>
                      <div className="text-xs text-text-500 mt-1">{s.createdAt} · {s.operator}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {diff > 0 && (
                        <div className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-lg",
                          profit < 0 ? "bg-danger-50 text-danger-600" : profit > 0 ? "bg-success-50 text-success-600" : "bg-background-50 text-text-600"
                        )}>
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          差异 {profit > 0 ? "+" : ""}{profit} 件
                        </div>
                      )}
                      <span className={cn(
                        "badge",
                        s.status === "draft" ? "badge-default" : "badge-success"
                      )}>
                        {s.status === "draft" ? "草稿" : "已确认"}
                      </span>
                    </div>
                  </div>
                  <div className="table-wrap rounded-lg overflow-hidden border border-border-100">
                    <table className="table text-sm">
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
                            <td
                              className="font-medium text-text-800 cursor-pointer hover:text-primary-600 hover:underline"
                              onClick={() => setShowProductHistory({ id: it.productId, name: it.productName })}
                            >{it.productName}</td>
                            <td className="text-right text-text-600">{it.systemStock}</td>
                            <td className="text-right font-medium text-text-900">{it.actualStock}</td>
                            <td className={cn(
                              "text-right font-bold",
                              it.diff < 0 ? "text-danger-600" : it.diff > 0 ? "text-success-600" : "text-text-400"
                            )}>
                              {it.diff > 0 ? "+" : ""}{it.diff}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============ 报损 ============ */}
        {activeTab === "damage" && (
          <div className="table-wrap rounded-xl border border-border-100 overflow-hidden">
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
                    <td className="font-mono text-xs text-text-700">{r.relatedOrderNo}</td>
                    <td
                      className="font-medium text-text-900 cursor-pointer hover:text-primary-600 hover:underline"
                      onClick={() => setShowProductHistory({ id: r.productId, name: r.productName })}
                    >{r.productName}</td>
                    <td className="text-danger-600 font-bold">-{r.quantity}</td>
                    <td>{r.beforeStock}</td>
                    <td>{r.afterStock}</td>
                    <td className="text-text-600 max-w-48">{r.remark || "-"}</td>
                    <td>{r.operator}</td>
                    <td className="text-text-500 text-xs">{r.createdAt}</td>
                  </tr>
                ))}
                {stockRecords.filter((r) => r.type === "damage").length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-text-400">暂无报损记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ============ 预警 ============ */}
        {activeTab === "warning" && (
          <div>
            <div className="p-4 mb-5 rounded-xl bg-gradient-to-r from-warning-50 to-orange-50 border border-warning-200">
              <div className="flex items-center gap-3 mb-1.5">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <span className="text-sm font-semibold text-warning-800">
                  以下 {lowStockProducts.length} 个商品库存低于安全阈值，请及时补货
                </span>
              </div>
              <div className="text-xs text-warning-700/80">建议立即通过入库管理流程采购补充</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lowStockProducts.length === 0 && <div className="col-span-full text-center py-12 text-text-400">暂无低库存预警</div>}
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border-2 border-danger-200 bg-gradient-to-br from-danger-50/50 to-white hover:shadow-pop transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={p.imageUrl} className="w-14 h-14 rounded-lg object-cover border border-border-100" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-900 truncate">{p.name}</div>
                      <div className="text-xs text-text-500">{p.categoryName} · {p.ageRange}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <span className="text-xs text-text-500">当前库存</span>
                      <div className="text-2xl font-bold text-danger-600">{p.stock}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-text-500">安全库存</span>
                      <div className="text-lg font-semibold text-text-700">{p.safetyStock}</div>
                    </div>
                    <div className="w-24">
                      <div className="h-2.5 bg-background-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-danger-500 to-warning-500 rounded-full" style={{ width: `${Math.min(100, (p.stock / p.safetyStock) * 100)}%` }}></div>
                      </div>
                      <div className="text-[10px] text-right mt-1 text-danger-600 font-medium">缺 {p.safetyStock - p.stock}</div>
                    </div>
                  </div>
                  <button
                    className="w-full btn-primary btn-sm"
                    onClick={() => {
                      setActiveTab("inbound");
                      setShowInbound(true);
                      setInboundData({ productId: p.id, qty: p.safetyStock, supplier: "", remark: "补货" });
                    }}
                  >立即补货</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============ 入库弹窗 ============ */}
      {showInbound && (
        <Modal title="新建入库单" onClose={() => setShowInbound(false)}>
          <ModalBody>
            <div className="space-y-4">
              <Field label="选择商品 *">
                <select className="select" value={inboundData.productId} onChange={(e) => setInboundData({ ...inboundData, productId: e.target.value })}>
                  <option value="">请选择商品</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (库存: {p.stock})</option>)}
                </select>
              </Field>
              <Field label="入库数量">
                <input type="number" min="1" className="input" value={inboundData.qty} onChange={(e) => setInboundData({ ...inboundData, qty: Number(e.target.value) })} />
              </Field>
              <Field label="供应商">
                <select className="select" value={inboundData.supplier} onChange={(e) => setInboundData({ ...inboundData, supplier: e.target.value })}>
                  <option value="">请选择</option>
                  {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="备注">
                <input className="input" value={inboundData.remark} onChange={(e) => setInboundData({ ...inboundData, remark: e.target.value })} placeholder="选填" />
              </Field>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowInbound(false)}>取消</button>
            <button className="btn-primary" onClick={submitInbound}>确认入库</button>
          </ModalFooter>
        </Modal>
      )}

      {/* ============ 报损弹窗 ============ */}
      {showDamage && (
        <Modal title="商品报损登记" onClose={() => setShowDamage(false)}>
          <ModalBody>
            <div className="space-y-4">
              <Field label="选择商品 *">
                <select className="select" value={damageData.productId} onChange={(e) => setDamageData({ ...damageData, productId: e.target.value })}>
                  <option value="">请选择商品</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (库存: {p.stock})</option>)}
                </select>
              </Field>
              <Field label="报损数量">
                <input
                  type="number"
                  min="1"
                  max={damageData.productId ? (products.find(p => p.id === damageData.productId)?.stock || 1) : 9999}
                  className="input"
                  value={damageData.qty}
                  onChange={(e) => setDamageData({ ...damageData, qty: Number(e.target.value) })}
                />
                {damageData.productId && (
                  <p className="text-xs text-text-500 mt-1">当前库存 {products.find(p => p.id === damageData.productId)?.stock} 件</p>
                )}
              </Field>
              <Field label="报损原因">
                <select className="select" value={damageData.reason} onChange={(e) => setDamageData({ ...damageData, reason: e.target.value })}>
                  <option value="">请选择</option>
                  <option>自然损坏（老化）</option>
                  <option>人为损坏（顾客）</option>
                  <option>人为损坏（内部）</option>
                  <option>运输破损</option>
                  <option>丢失被盗</option>
                  <option>质量问题</option>
                  <option>过期淘汰</option>
                </select>
              </Field>
              <Field label="详细说明">
                <textarea
                  className="input min-h-[80px] resize-none"
                  value={damageData.remark}
                  onChange={(e) => setDamageData({ ...damageData, remark: e.target.value })}
                  placeholder="请描述具体情况..."
                />
              </Field>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowDamage(false)}>取消</button>
            <button className="btn-danger bg-danger hover:bg-danger-600" onClick={submitDamage}>确认报损</button>
          </ModalFooter>
        </Modal>
      )}

      {/* ============ 盘点弹窗 ============ */}
      {showStocktake && (
        <Modal title="创建盘点任务" onClose={() => setShowStocktake(false)} size="xl">
          <ModalBody>
            <div className="space-y-4">
              <Field label="盘点名称 *">
                <input
                  className="input"
                  placeholder="例：6月中旬全店盘点 / 积木区周盘"
                  value={stocktakeName}
                  onChange={(e) => setStocktakeName(e.target.value)}
                />
              </Field>
              <div className="flex items-center justify-between">
                <label className="label mb-0">盘点商品明细</label>
                <button className="btn-outline btn-sm flex items-center gap-1" onClick={addStocktakeItem}>
                  <Plus className="w-3.5 h-3.5" />添加商品
                </button>
              </div>
              <div className="rounded-xl border border-border-100 max-h-80 overflow-auto">
                <table className="table text-sm">
                  <thead className="sticky top-0 bg-background-50">
                    <tr>
                      <th>商品名称</th>
                      <th className="text-right">系统库存</th>
                      <th className="text-right">实盘数</th>
                      <th className="text-right">差异</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocktakeItems.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-text-400 text-sm">点击右上角「添加商品」选择需盘点的商品</td></tr>
                    )}
                    {stocktakeItems.map((it) => (
                      <tr key={it.productId}>
                        <td className="font-medium text-text-800">{it.productName}</td>
                        <td className="text-right text-text-600 font-mono">{it.systemStock}</td>
                        <td className="text-right w-32">
                          <input
                            type="number"
                            min="0"
                            className="input !py-1.5 text-right !text-sm"
                            value={it.actualStock}
                            onChange={(e) => updateStocktakeActual(it.productId, Number(e.target.value))}
                          />
                        </td>
                        <td className={cn(
                          "text-right font-bold font-mono",
                          (it.actualStock - it.systemStock) < 0 ? "text-danger-600" :
                          (it.actualStock - it.systemStock) > 0 ? "text-success-600" : "text-text-400"
                        )}>
                          {it.actualStock - it.systemStock > 0 ? "+" : ""}{it.actualStock - it.systemStock}
                        </td>
                        <td className="text-center">
                          <button
                            className="p-1.5 rounded-lg hover:bg-danger-50 text-text-400 hover:text-danger-600 transition"
                            onClick={() => removeStocktakeItem(it.productId)}
                          ><X className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowStocktake(false)}>取消</button>
            <button className="btn-outline" onClick={() => submitStocktake(false)}>保存草稿</button>
            <button className="btn-primary" onClick={() => submitStocktake(true)}>确认盘点(同步库存)</button>
          </ModalFooter>
        </Modal>
      )}

      {/* ============ 新建调拨弹窗 ============ */}
      {showTransfer && (
        <Modal title="新建调拨单" onClose={() => setShowTransfer(false)} size="lg">
          <ModalBody>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="调出门店 *">
                  <select
                    className="select"
                    value={transferForm.fromStore}
                    onChange={(e) => setTransferForm({ ...transferForm, fromStore: e.target.value })}
                  >
                    {storeList.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="调入门店 *">
                  <select
                    className="select"
                    value={transferForm.toStore}
                    onChange={(e) => setTransferForm({ ...transferForm, toStore: e.target.value })}
                  >
                    {storeList.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              {transferForm.fromStore === transferForm.toStore && (
                <div className="text-xs text-danger bg-danger-50 rounded-lg px-3 py-2">
                  ⚠️ 调出门店与调入门店不能相同
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">调拨商品明细 *</label>
                  <button className="btn-outline btn-sm flex items-center gap-1" onClick={addTransferItem}>
                    <Plus className="w-3.5 h-3.5" />添加商品
                  </button>
                </div>
                <div className="rounded-xl border border-border-100 max-h-72 overflow-auto">
                  <table className="table text-sm">
                    <thead className="sticky top-0 bg-background-50">
                      <tr>
                        <th>商品名称</th>
                        <th className="w-28 text-right">当前库存</th>
                        <th className="w-32 text-right">申请数量</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferForm.items.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-text-400 text-sm">点击右上角「添加商品」选择需调拨的商品</td></tr>
                      )}
                      {transferForm.items.map((it) => {
                        const p = products.find((x) => x.id === it.productId);
                        return (
                          <tr key={it.productId}>
                            <td>
                              <select
                                className="select !py-1.5 !text-sm"
                                value={it.productId}
                                onChange={(e) => changeTransferItem(it.productId, "productId", e.target.value)}
                              >
                                {products.map((pr) => (
                                  <option key={pr.id} value={pr.id}>{pr.name}（库存 {pr.stock}）</option>
                                ))}
                              </select>
                            </td>
                            <td className="text-right font-mono text-text-600">{p?.stock ?? 0}</td>
                            <td className="text-right w-32">
                              <input
                                type="number"
                                min="1"
                                max={p?.stock || 9999}
                                className="input !py-1.5 !text-sm !text-right"
                                value={it.quantity}
                                onChange={(e) => changeTransferItem(it.productId, "quantity", e.target.value)}
                              />
                            </td>
                            <td className="text-center">
                              <button
                                className="p-1.5 rounded-lg hover:bg-danger-50 text-text-400 hover:text-danger-600"
                                onClick={() => removeTransferItem(it.productId)}
                              ><X className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {transferForm.items.length > 0 && (
                  <div className="mt-3 text-xs text-text-500">
                    共 {transferForm.items.length} 件商品，申请调拨合计 
                    <span className="text-text-900 font-semibold ml-1">
                      {transferForm.items.reduce((s, x) => s + x.quantity, 0)} 件
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowTransfer(false)}>取消</button>
            <button
              className={cn("btn-primary",
                (transferForm.fromStore === transferForm.toStore || transferForm.items.length === 0) && "opacity-50 cursor-not-allowed"
              )}
              onClick={submitTransferCreate}
            >创建调拨单（待发货）</button>
          </ModalFooter>
        </Modal>
      )}

      {/* ============ 商品流水明细弹窗 ============ */}
      {showProductHistory && (
        <Modal
          title={`📋 「${showProductHistory.name}」库存流水明细`}
          onClose={() => setShowProductHistory(null)}
          size="xl"
        >
          <ModalBody>
            {(() => {
              const p = products.find((x) => x.id === showProductHistory.id);
              const records = stockRecords
                .filter((r) => r.productId === showProductHistory.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const diffQty = records.length ? records[0].afterStock : p?.stock ?? 0;
              return (
                <div className="space-y-4">
                  {p && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 flex items-center gap-4">
                      <img src={p.imageUrl} className="w-16 h-16 rounded-lg object-cover border border-white" />
                      <div className="flex-1">
                        <div className="font-bold text-text-900">{p.name}</div>
                        <div className="text-xs text-text-500 mt-0.5">{p.categoryName} · {p.ageRange} · 条码 {p.barcode}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-500">当前库存</div>
                        <div className="text-2xl font-bold text-primary-600">{p.stock}</div>
                        <div className="text-[10px] text-text-400 mt-0.5">安全库存 {p.safetyStock}</div>
                      </div>
                    </div>
                  )}
                  <div className="rounded-xl border border-border-100 max-h-[52vh] overflow-auto">
                    <table className="table text-sm">
                      <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr>
                          <th>单号</th>
                          <th>类型</th>
                          <th>变动</th>
                          <th className="text-right">变动前</th>
                          <th className="text-right">变动后</th>
                          <th>操作人</th>
                          <th className="w-56">备注</th>
                          <th className="text-right">时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.length === 0 && (
                          <tr><td colSpan={8} className="text-center py-12 text-text-400">该商品暂无库存流水记录</td></tr>
                        )}
                        {records.map((r) => {
                          const cfg = typeConfig[r.type] || typeConfig.inbound;
                          const CfgIcon = cfg.icon;
                          const dir = cfg.dir;
                          const qtyColor = dir === "+" ? "text-emerald-600" : dir === "-" ? "text-danger-600" : "text-secondary-600";
                          const qtySign = dir === "+" ? "+" : dir === "-" ? "-" : r.type === "transfer" ? (r.remark?.includes("入库") ? "+" : "-") : r.type === "stocktake" ? (r.afterStock > r.beforeStock ? "+" : r.afterStock < r.beforeStock ? "-" : "") : "";
                          return (
                            <tr key={r.id} className="hover:bg-background-50">
                              <td className="font-mono text-xs text-text-700">{r.relatedOrderNo}</td>
                              <td>
                                <span className={cn("badge", cfg.cls)}>
                                  <CfgIcon className="w-3 h-3 inline mr-1" />{cfg.label}
                                </span>
                              </td>
                              <td className={cn("font-bold", qtyColor)}>
                                {qtySign}{r.quantity}
                              </td>
                              <td className="text-right font-mono">{r.beforeStock}</td>
                              <td className="text-right font-mono">{r.afterStock}</td>
                              <td>{r.operator}</td>
                              <td className="text-xs text-text-500 max-w-56 truncate" title={r.remark}>
                                {r.remark || "—"}
                              </td>
                              <td className="text-right text-xs text-text-400">{r.createdAt}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {records.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(typeConfig).map(([k, v]) => {
                        const cnt = records.filter((r) => r.type === k).length;
                        if (cnt === 0) return null;
                        const VIc = v.icon;
                        return (
                          <span key={k} className={cn("px-2.5 py-1 rounded-lg", v.cls)}>
                            <VIc className="w-3 h-3 inline mr-1" />{v.label} {cnt}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </ModalBody>
          <ModalFooter>
            <button className="btn-primary" onClick={() => setShowProductHistory(null)}>关闭</button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, size = "md" }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 animate-fade-in-up" onClick={onClose}>
      <div
        className={cn(
          "w-full bg-white rounded-2xl shadow-pop overflow-hidden",
          size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : "max-w-lg"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-100">
          <h2 className="text-lg font-bold text-text-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-50 text-text-400 hover:text-text-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalBody({ children }: any) {
  return <div className="px-6 py-5">{children}</div>;
}

function ModalFooter({ children }: any) {
  return (
    <div className="px-6 py-4 bg-background-50 border-t border-border-100 flex justify-end gap-3">
      {children}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
