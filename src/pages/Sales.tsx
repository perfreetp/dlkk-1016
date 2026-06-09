import { useState } from "react";
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

  const [cart, setCart] = useState<{ productId: string; productName: string; price: number; qty: number; discount: number; imageUrl: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [payMethod, setPayMethod] = useState("wechat");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showPaid, setShowPaid] = useState<null | { no: string; amount: number }>(null);

  const rootCats = categories.filter((c) => !c.parentId);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !productSearch || p.name.includes(productSearch) || p.sku.includes(productSearch) || p.barcode.includes(productSearch);
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory || categories.find((c) => c.id === selectedCategory) ? (selectedCategory && (p.categoryId === selectedCategory || categories.find((c) => c.id === p.categoryId)?.parentId === selectedCategory)) : true;
    return matchesSearch && (selectedCategory ? matchesCat : true);
  });

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((c) => c.productId === product.id);
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
      const newQty = c.qty + delta;
      return newQty > 0 ? { ...c, qty: newQty } : c;
    }).filter((c) => c.qty > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty * c.discount, 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  const checkout = () => {
    if (cart.length === 0) return;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const now = new Date();
    const orderNo = `S${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
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
      createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    });
    cart.forEach((c) => {
      const p = products.find((x) => x.id === c.productId);
      if (p) updateProduct(p.id, { stock: Math.max(0, p.stock - c.qty) });
    });
    setShowPaid({ no: orderNo, amount: Math.round(totalAmount * 100) / 100 });
    setCart([]);
    setDiscount(0);
    setTimeout(() => setShowPaid(null), 2500);
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
                    <th>时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {saleOrders.slice(0, 50).map((o) => (
                    <tr key={o.id}>
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
                      <td className="text-xs text-text-tertiary">{o.createdAt}</td>
                      <td>
                        {o.status === "paid" && (
                          <button className="text-xs text-primary-600 hover:underline" onClick={() => setShowReturn(true)}>退货</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40" onClick={() => setShowReturn(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-pop p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-warning" /> 退换货处理
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">原订单号 *</label>
                <input className="input" placeholder="输入或扫码原订单号" />
              </div>
              <div>
                <label className="label">处理类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-8 rounded-xl border-2 border-primary-500 bg-primary-50 text-primary-700 font-semibold">
                    <RefreshCcw className="w-6 h-6 mx-auto mb-1" />
                    退货退款
                  </button>
                  <button className="py-8 rounded-xl border-2 border-border text-text-secondary hover:border-secondary-400 hover:bg-secondary-50 hover:text-secondary-700 font-semibold">
                    <ArrowLeftRight className="w-6 h-6 mx-auto mb-1" />
                    换货
                  </button>
                </div>
              </div>
              <div>
                <label className="label">退款金额 (¥)</label>
                <input type="number" className="input" defaultValue={0} />
              </div>
              <div>
                <label className="label">原因</label>
                <textarea className="input min-h-[80px]" placeholder="请输入退换货原因..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-outline" onClick={() => setShowReturn(false)}>取消</button>
              <button className="btn-primary" onClick={() => setShowReturn(false)}>确认处理</button>
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
