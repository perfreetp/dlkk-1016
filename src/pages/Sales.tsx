import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Scan,
  Search,
  Banknote,
  QrCode,
  CreditCard,
  UserCircle,
  History,
  RefreshCcw,
  Package,
  X,
  CheckCircle2,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const payMethods = [
  { id: "cash", label: "现金", icon: Banknote, cls: "bg-emerald-100 text-emerald-700" },
  { id: "wechat", label: "微信", icon: QrCode, cls: "bg-green-100 text-green-700" },
  { id: "alipay", label: "支付宝", icon: QrCode, cls: "bg-blue-100 text-blue-700" },
  { id: "member", label: "会员卡", icon: UserCircle, cls: "bg-purple-100 text-purple-700" },
];

export default function Sales() {
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const members = useAppStore((s) => s.members);
  const saleOrders = useAppStore((s) => s.saleOrders);
  const addSale = useAppStore((s) => s.addSale);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const updateSale = useAppStore((s) => s.updateSale);
  const addStockRecord = useAppStore((s) => s.addStockRecord);
  const orderFocus = useAppStore((s) => s.orderFocus);
  const setOrderFocus = useAppStore((s) => s.setOrderFocus);

  const [highlightOrderNo, setHighlightOrderNo] = useState<string | null>(null);

  useEffect(() => {
    if (orderFocus?.page === "sales" && orderFocus.orderNo) {
      setShowHistory(true);
      const targetNo = orderFocus.orderNo;
      setTimeout(() => {
        const el = document.getElementById(`sale-row-${targetNo}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightOrderNo(targetNo);
          setTimeout(() => setHighlightOrderNo(null), 4000);
          setOrderFocus(null);
        }
      }, 300);
    }
  }, [orderFocus]);

  const [cart, setCart] = useState<{ productId: string; productName: string; price: number; qty: number; discount: number; imageUrl: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [payMethod, setPayMethod] = useState("wechat");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showPaid, setShowPaid] = useState<null | { no: string; amount: number }>(null);

  const [returnOrderNo, setReturnOrderNo] = useState("");
  const [returnType, setReturnType] = useState<"return" | "exchange">("return");
  const [returnReason, setReturnReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [processNote, setProcessNote] = useState("");

  const rootCats = categories.filter((c) => !c.parentId);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !productSearch || p.name.includes(productSearch) || p.sku.includes(productSearch) || p.barcode.includes(productSearch);
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory || categories.find((c) => c.id === selectedCategory) ? (selectedCategory && (p.categoryId === selectedCategory || categories.find((c) => c.id === p.categoryId)?.parentId === selectedCategory)) : true;
    return matchesSearch && (selectedCategory ? matchesCat : true);
  });

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((c) => c.productId === product.id);
    const curQty = existing?.qty || 0;
    const maxCanAdd = product.stock - curQty;
    if (product.stock <= 0) return alert(`商品「${product.name}」当前库存为 0，无法添加`);
    if (maxCanAdd <= 0) return alert(`商品「${product.name}」已加 ${curQty} 件到购物车，达到最大库存`);
    if (existing) {
      setCart(cart.map((c) => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.salePrice,
        qty: 1,
        discount: 1,
        imageUrl: product.imageUrl,
      }]);
    }
  };

  const removeFromCart = (productId: string) => setCart(cart.filter((c) => c.productId !== productId));
  const updateQty = (productId: string, delta: number) => {
    setCart(cart.map((c) => {
      if (c.productId !== productId) return c;
      const p = products.find((x) => x.id === c.productId);
      const stock = p?.stock || 0;
      const newQty = c.qty + delta;
      if (newQty > stock) { alert(`商品「${c.productName}」最多只能 ${stock} 件`); return c; }
      return newQty > 0 ? { ...c, qty: newQty } : c;
    }).filter((c) => c.qty > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty * c.discount, 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  const checkout = () => {
    if (cart.length === 0) return;
    const lacks: string[] = [];
    cart.forEach((c) => {
      const p = products.find((x) => x.id === c.productId);
      const stock = p?.stock || 0;
      if (c.qty > stock) {
        lacks.push(`· ${c.productName}：需 ${c.qty}，库存 ${stock}，缺 ${c.qty - stock}`);
      }
    });
    if (lacks.length > 0) {
      alert(`⚠️ 以下商品库存不足，无法继续收款：\n\n${lacks.join("\n")}`);
      return;
    }
    const pad = (n: number) => n.toString().padStart(2, "0");
    const now = new Date();
    const orderNo = `S${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const member = members.find((m) => m.id === selectedMember);
    addSale({
      id: `s${Date.now()}`,
      orderNo,
      items: cart.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        quantity: c.qty,
        price: c.price,
        discount: c.discount,
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: discount,
      totalAmount: Math.round(totalAmount * 100) / 100,
      payMethod: payMethod as any,
      memberId: selectedMember || undefined,
      status: "paid",
      operator: member ? member.name : "店员小陈",
      createdAt,
    });
    cart.forEach((c) => {
      const p = products.find((x) => x.id === c.productId);
      if (p) {
        addStockRecord({
          id: `stk${Date.now()}-${c.productId}`,
          type: "sale",
          productId: c.productId,
          productName: c.productName,
          quantity: c.qty,
          beforeStock: p.stock,
          afterStock: Math.max(0, p.stock - c.qty),
          relatedOrderNo: orderNo,
          operator: member ? member.name : "店员小陈",
          remark: `销售 · ${payMethod === "cash" ? "现金" : payMethod === "wechat" ? "微信" : payMethod === "alipay" ? "支付宝" : "会员卡"}`,
          createdAt,
        });
        updateProduct(p.id, { stock: Math.max(0, p.stock - c.qty) });
      }
    });
    setShowPaid({ no: orderNo, amount: Math.round(totalAmount * 100) / 100 });
    setCart([]);
    setDiscount(0);
    setTimeout(() => setShowPaid(null), 2500);
  };

  const foundOrder = saleOrders.find((o) => o.orderNo === returnOrderNo.trim());

  const resetReturnForm = () => {
    setReturnOrderNo("");
    setReturnType("return");
    setReturnReason("");
    setRefundAmount(0);
    setProcessNote("");
  };

  const openReturnForOrder = (order: any) => {
    setReturnOrderNo(order.orderNo);
    setReturnType("return");
    setReturnReason("");
    setRefundAmount(order.totalAmount);
    setProcessNote("");
    setShowReturn(true);
  };

  const openExchangeForOrder = (order: any) => {
    setReturnOrderNo(order.orderNo);
    setReturnType("exchange");
    setReturnReason("");
    setRefundAmount(0);
    setProcessNote("");
    setShowReturn(true);
  };

  const submitReturnProcess = () => {
    if (!foundOrder) return alert("未找到对应的订单号");
    if (foundOrder.status !== "paid") return alert("该订单已处理过退换货，无法重复操作");
    if (returnType === "return" && refundAmount < 0) return alert("退款金额不能为负数");
    if (!returnReason.trim()) return alert("请填写退换货原因");

    const pad = (n: number) => n.toString().padStart(2, "0");
    const now = new Date();
    const processedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if (returnType === "return") {
      foundOrder.items.forEach((it: any) => {
        const p = products.find((x) => x.id === it.productId);
        if (p) {
          addStockRecord({
            id: `stk${Date.now()}-${it.productId}`,
            type: "sale_return",
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            beforeStock: p.stock,
            afterStock: p.stock + it.quantity,
            relatedOrderNo: foundOrder.orderNo,
            operator: "店长-李明",
            remark: `销售退货 · 退款¥${refundAmount} · 原因：${returnReason}`,
            createdAt: processedAt,
          });
          updateProduct(p.id, { stock: p.stock + it.quantity });
        }
      });
      updateSale(foundOrder.id, {
        status: "returned",
        returnReason,
        refundAmount,
        processNote,
        processedAt,
      });
    } else {
      updateSale(foundOrder.id, {
        status: "exchanged",
        exchangeReason: returnReason,
        processNote,
        processedAt,
      });
    }

    alert(`${returnType === "return" ? "退货退款" : "换货"}处理成功！`);
    resetReturnForm();
    setShowReturn(false);
  };

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">销售管理</h1>
          <p className="text-sm text-text-secondary mt-1">
            本月订单 {saleOrders.length} · 营业额 ¥{saleOrders.reduce((s, o) => s + o.totalAmount, 0).toFixed(0)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setShowReturn(true)}>
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            退换货
          </button>
          <button className="btn-outline" onClick={() => setShowHistory(true)}>
            <History className="w-4 h-4 mr-2" />
            历史订单
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 gap-4">
          <div className="card-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  className="input pl-10 py-2"
                  placeholder="搜索商品名、SKU、条码，或扫码..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <button className="btn-outline !py-2">
                <Scan className="w-4 h-4 mr-2" />
                扫码
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <button
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  !selectedCategory ? "bg-primary-500 text-white shadow-sm" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                )}
                onClick={() => setSelectedCategory(null)}
              >
                全部
              </button>
              {rootCats.map((c) => (
                <button
                  key={c.id}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    selectedCategory === c.id ? "bg-primary-500 text-white shadow-sm" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  )}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card-sm flex-1 overflow-auto scrollbar-thin">
            <div className="grid grid-cols-4 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="group cursor-pointer rounded-xl border-2 border-border hover:border-primary-400 overflow-hidden bg-white transition-all hover:shadow-card-hover"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-medium",
                        p.stock <= p.safetyStock ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        库存 {p.stock}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-md">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-medium text-text-primary line-clamp-1">{p.name}</div>
                    <div className="mt-1 flex items-end justify-between">
                      <span className="text-base font-bold text-primary-600">¥{p.salePrice}</span>
                      <span className="text-[10px] text-text-tertiary">{p.ageRange}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[420px] card flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">收银台</h3>
                <p className="text-[11px] text-text-tertiary">{totalQty} 件商品</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                className="text-xs text-danger font-medium flex items-center gap-1 hover:underline"
                onClick={() => setCart([])}
              >
                <Trash2 className="w-3 h-3" />
                清空
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto scrollbar-thin -mx-6 px-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                <Package className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">购物车是空的</p>
                <p className="text-xs mt-1">点击左侧商品添加</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cart.map((c) => (
                  <div key={c.productId} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <img src={c.imageUrl} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{c.productName}</div>
                      <div className="text-xs text-primary-600 font-semibold">¥{c.price}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 bg-white rounded-lg border border-border">
                        <button
                          className="w-7 h-7 rounded-l-lg hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => updateQty(c.productId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{c.qty}</span>
                        <button
                          className="w-7 h-7 rounded-r-lg hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => updateQty(c.productId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(c.productId)}
                        className="text-[10px] text-danger flex items-center gap-0.5 hover:underline"
                      >
                        <Trash2 className="w-2.5 h-2.5" />移除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div>
              <label className="label text-xs text-text-secondary">会员折扣（选填）</label>
              <select
                className="select py-2"
                value={selectedMember}
                onChange={(e) => {
                  setSelectedMember(e.target.value);
                  const m = members.find((x) => x.id === e.target.value);
                  if (m) {
                    const disc = m.level === "platinum" ? 0.85 : m.level === "gold" ? 0.9 : m.level === "silver" ? 0.95 : 1;
                    setDiscount(Math.round(subtotal * (1 - disc) * 100) / 100);
                  } else {
                    setDiscount(0);
                  }
                }}
              >
                <option value="">散客（无折扣）</option>
                {members.filter((m) => m.status === "active").map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {levelConfig[m.level].label} (
                    {m.level === "platinum" ? "85折" : m.level === "gold" ? "9折" : m.level === "silver" ? "95折" : "无折扣"}
                    )
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-xs text-text-secondary">收款方式</label>
              <div className="grid grid-cols-4 gap-2">
                {payMethods.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPayMethod(pm.id)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 border-2",
                        payMethod === pm.id
                          ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm"
                          : "bg-white border-border text-text-secondary hover:border-gray-300"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">商品小计</span>
                <span className="font-medium">¥{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">优惠减免</span>
                <span className="font-medium text-danger">-¥{discount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-1"></div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-text-secondary">应收金额</span>
                <span className="text-3xl font-bold text-primary-600">
                  ¥{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className={cn(
                "w-full btn-lg font-bold text-base rounded-2xl transition-all",
                cart.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
              )}
              disabled={cart.length === 0}
              onClick={checkout}
            >
              <CreditCard className="w-5 h-5 mr-2 inline" />
              确认收款 ({totalQty}件)
            </button>
          </div>
        </div>
      </div>

      {showPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowPaid(null)}>
          <div className="bg-white rounded-3xl shadow-pop p-10 text-center animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">收款成功！</h3>
            <p className="text-sm text-text-secondary mb-4">订单号：{showPaid.no}</p>
            <p className="text-4xl font-bold text-primary-600">¥{showPaid.amount}</p>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40" onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-pop overflow-hidden flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">历史销售订单</h2>
              <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center" onClick={() => setShowHistory(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto scrollbar-thin flex-1">
              <table className="table">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr>
                    <th>订单号</th>
                    <th>商品</th>
                    <th>件数</th>
                    <th>金额</th>
                    <th>支付</th>
                    <th>会员</th>
                    <th>状态</th>
                    <th>处理结果</th>
                    <th>时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {saleOrders.slice(0, 50).map((o) => (
                    <tr
                      key={o.id}
                      id={`sale-row-${o.orderNo}`}
                      className={cn(
                        highlightOrderNo === o.orderNo &&
                          "bg-yellow-100/80 ring-2 ring-yellow-400 ring-offset-1 transition-all duration-700"
                      )}
                    >
                      <td className="font-mono text-xs">{o.orderNo}</td>
                      <td className="max-w-40 truncate text-xs">{o.items.map((i) => i.productName).join("、")}</td>
                      <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td className="font-semibold text-primary-600">¥{o.totalAmount}</td>
                      <td>
                        <span className={cn("badge",
                          o.payMethod === "cash" && "bg-emerald-100 text-emerald-700",
                          o.payMethod === "wechat" && "bg-green-100 text-green-700",
                          o.payMethod === "alipay" && "bg-blue-100 text-blue-700",
                          o.payMethod === "member" && "bg-purple-100 text-purple-700"
                        )}>
                          {o.payMethod === "cash" ? "现金" : o.payMethod === "wechat" ? "微信" : o.payMethod === "alipay" ? "支付宝" : "会员卡"}
                        </span>
                      </td>
                      <td className="text-xs">{members.find((m) => m.id === o.memberId)?.name || "散客"}</td>
                      <td>
                        <span className={cn("badge",
                          o.status === "paid" ? "bg-emerald-100 text-emerald-700" : o.status === "returned" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {o.status === "paid" ? "已支付" : o.status === "returned" ? "已退货" : "已换货"}
                        </span>
                      </td>
                      <td className="text-xs min-w-[180px]">
                        {o.status === "paid" ? (
                          <span className="text-text-tertiary">—</span>
                        ) : o.status === "returned" ? (
                          <div>
                            <div className="text-red-600 font-medium">退款 ¥{o.refundAmount ?? 0}</div>
                            <div className="text-text-tertiary mt-0.5 truncate" title={o.returnReason}>原因：{o.returnReason || "—"}</div>
                            {o.processedAt && <div className="text-text-tertiary">{o.processedAt}</div>}
                          </div>
                        ) : (
                          <div>
                            <div className="text-orange-600 font-medium">已换货</div>
                            <div className="text-text-tertiary mt-0.5 truncate" title={o.exchangeReason}>原因：{o.exchangeReason || "—"}</div>
                            {o.processedAt && <div className="text-text-tertiary">{o.processedAt}</div>}
                          </div>
                        )}
                      </td>
                      <td className="text-xs text-text-tertiary">{o.createdAt}</td>
                      <td className="min-w-[120px]">
                        {o.status === "paid" && (
                          <div className="flex gap-2">
                            <button className="text-xs text-primary-600 hover:underline" onClick={() => openReturnForOrder(o)}>退货</button>
                            <button className="text-xs text-orange-600 hover:underline" onClick={() => openExchangeForOrder(o)}>换货</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40" onClick={() => { setShowReturn(false); resetReturnForm(); }}>
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-pop p-6 animate-fade-in-up overflow-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-warning" /> 退换货处理
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">原订单号 *</label>
                <input
                  className="input"
                  placeholder="输入或扫码原订单号，例如 S2025..."
                  value={returnOrderNo}
                  onChange={(e) => {
                    setReturnOrderNo(e.target.value);
                    const ord = saleOrders.find((o) => o.orderNo === e.target.value.trim());
                    if (ord && returnType === "return") {
                      setRefundAmount(ord.totalAmount);
                    }
                  }}
                />
                {returnOrderNo && (
                  <div className="mt-2 text-xs">
                    {foundOrder ? (
                      <span className="text-emerald-600">✓ 找到订单：{foundOrder.items.map((i) => i.productName).join("、")}，金额 ¥{foundOrder.totalAmount}</span>
                    ) : (
                      <span className="text-danger">未找到该订单号对应的订单</span>
                    )}
                  </div>
                )}
              </div>

              {foundOrder && (
                <div className="p-4 rounded-xl bg-gray-50 border border-border space-y-2 text-sm">
                  <div className="font-semibold text-text-primary border-b border-border pb-2 mb-2">📋 原订单详情</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>订单号：<span className="font-mono">{foundOrder.orderNo}</span></div>
                    <div>下单时间：{foundOrder.createdAt}</div>
                    <div>商品件数：{foundOrder.items.reduce((s, i) => s + i.quantity, 0)} 件</div>
                    <div>订单金额：<span className="text-primary-600 font-semibold">¥{foundOrder.totalAmount}</span></div>
                    <div>支付方式：{foundOrder.payMethod === "cash" ? "现金" : foundOrder.payMethod === "wechat" ? "微信" : foundOrder.payMethod === "alipay" ? "支付宝" : "会员卡"}</div>
                    <div>会员：{members.find((m) => m.id === foundOrder.memberId)?.name || "散客"}</div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border">
                    <div className="text-xs text-text-secondary mb-1">商品明细：</div>
                    {foundOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-xs border-b border-dashed last:border-0">
                        <span>{it.productName} × {it.quantity}</span>
                        <span>¥{(it.price * it.quantity * it.discount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {foundOrder.status !== "paid" && (
                    <div className="mt-2 text-xs text-danger font-medium">
                      ⚠️ 该订单当前状态：{foundOrder.status === "returned" ? "已退货" : "已换货"}，无法再次处理！
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="label">处理类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={cn(
                      "py-4 rounded-xl border-2 font-semibold transition-all",
                      returnType === "return"
                        ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                        : "border-border text-text-secondary hover:border-secondary-400 hover:bg-secondary-50 hover:text-secondary-700"
                    )}
                    onClick={() => {
                      setReturnType("return");
                      if (foundOrder) setRefundAmount(foundOrder.totalAmount);
                    }}
                  >
                    <RefreshCcw className="w-6 h-6 mx-auto mb-1" />
                    退货退款
                  </button>
                  <button
                    className={cn(
                      "py-4 rounded-xl border-2 font-semibold transition-all",
                      returnType === "exchange"
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                        : "border-border text-text-secondary hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
                    )}
                    onClick={() => {
                      setReturnType("exchange");
                      setRefundAmount(0);
                    }}
                  >
                    <ArrowLeftRight className="w-6 h-6 mx-auto mb-1" />
                    换货
                  </button>
                </div>
              </div>

              {returnType === "return" && (
                <div>
                  <label className="label">退款金额 (¥)</label>
                  <input
                    type="number"
                    className="input"
                    value={refundAmount}
                    min={0}
                    step={0.01}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                  />
                  {foundOrder && (
                    <div className="mt-1 text-xs text-text-secondary">
                      原订单实付 ¥{foundOrder.totalAmount}，可根据情况部分退款
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="label">{returnType === "return" ? "退货原因 *" : "换货原因 *"}</label>
                <select
                  className="select mb-2"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  <option value="">请选择原因...</option>
                  {returnType === "return" ? (
                    <>
                      <option value="商品质量问题">商品质量问题</option>
                      <option value="商品与描述不符">商品与描述不符</option>
                      <option value="不喜欢/不合适">不喜欢/不合适</option>
                      <option value="误购">误购</option>
                      <option value="其他">其他</option>
                    </>
                  ) : (
                    <>
                      <option value="商品质量问题">商品质量问题</option>
                      <option value="尺码不合适">尺码不合适</option>
                      <option value="款式不满意">款式不满意</option>
                      <option value="发错商品">发错商品</option>
                      <option value="其他">其他</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="label">处理备注</label>
                <textarea
                  className="input min-h-[70px]"
                  placeholder="（选填）补充说明处理细节..."
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <button className="btn-outline" onClick={() => { setShowReturn(false); resetReturnForm(); }}>取消</button>
              <button
                className={cn(
                  "btn-primary",
                  (!foundOrder || foundOrder.status !== "paid" || !returnReason.trim() || (returnType === "return" && refundAmount < 0)) && "opacity-50 cursor-not-allowed"
                )}
                onClick={submitReturnProcess}
              >确认处理</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const levelConfig: Record<string, { label: string }> = {
  normal: { label: "普通" },
  silver: { label: "银卡" },
  gold: { label: "金卡" },
  platinum: { label: "铂金" },
};
