import { useState } from "react";
import { useAppStore } from "@/store";
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Wallet,
  CalendarClock,
  AlertCircle,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  Ban,
  Phone,
  Edit2,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const levelConfig: Record<string, { label: string; cls: string; icon: any }> = {
  normal: { label: "普通", cls: "bg-gray-100 text-gray-700", icon: Users },
  silver: { label: "银卡", cls: "bg-slate-100 text-slate-700", icon: Sparkles },
  gold: { label: "金卡", cls: "bg-amber-100 text-amber-700", icon: Crown },
  platinum: { label: "铂金", cls: "bg-purple-100 text-purple-700", icon: Crown },
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: "租借中", cls: "bg-blue-100 text-blue-700" },
  overdue: { label: "已逾期", cls: "bg-red-100 text-red-700" },
  completed: { label: "已完成", cls: "bg-emerald-100 text-emerald-700" },
  returned: { label: "已归还", cls: "bg-gray-100 text-gray-700" },
  pending: { label: "待生效", cls: "bg-orange-100 text-orange-700" },
};

export default function Rental() {
  const members = useAppStore((s) => s.members);
  const rentalOrders = useAppStore((s) => s.rentalOrders);
  const products = useAppStore((s) => s.products);
  const updateMember = useAppStore((s) => s.updateMember);
  const updateRental = useAppStore((s) => s.updateRental);

  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [rentalTab, setRentalTab] = useState<"active" | "all">("active");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalFormData, setRentalFormData] = useState({
    memberId: "",
    products: [] as { productId: string; productName: string; rentalPrice: number; qty: number }[],
    days: 3,
  });

  const filteredMembers = members.filter(
    (m) =>
      !memberSearch ||
      m.name.includes(memberSearch) ||
      m.phone.includes(memberSearch) ||
      m.memberNo.includes(memberSearch)
  );

  const currentMember = activeMember ? members.find((m) => m.id === activeMember) : null;
  const memberRentals = currentMember
    ? rentalOrders.filter((r) => r.memberId === currentMember.id)
    : [];

  const activeRentals =
    rentalTab === "active"
      ? rentalOrders.filter((r) => r.status === "active" || r.status === "overdue")
      : rentalOrders;

  const handleReturn = (rentalId: string) => {
    const rental = rentalOrders.find((r) => r.id === rentalId);
    if (!rental || !currentMember) return;
    const totalRefund = rental.deposit - rental.penalty;
    updateRental(rentalId, {
      status: "completed",
      returnDate: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    updateMember(currentMember.id, {
      depositBalance: currentMember.depositBalance + totalRefund,
      totalRentals: currentMember.totalRentals + 1,
    });
  };

  const submitRental = () => {
    if (!rentalFormData.memberId || rentalFormData.products.length === 0) return;
    const member = members.find((m) => m.id === rentalFormData.memberId);
    const totalRentalFee = rentalFormData.products.reduce((s, p) => s + p.rentalPrice * rentalFormData.days * p.qty, 0);
    const totalDeposit = rentalFormData.products.reduce((s, p) => {
      const prod = products.find((pr) => pr.id === p.productId);
      return s + (prod?.costPrice || 100) * p.qty;
    }, 0);
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + rentalFormData.days);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    useAppStore.getState().addRental({
      id: `r${Date.now()}`,
      orderNo: `R${new Date().getFullYear()}${pad(new Date().getMonth() + 1)}${pad(new Date().getDate())}${Math.floor(Math.random() * 900 + 100)}`,
      memberId: rentalFormData.memberId,
      memberName: member?.name || "",
      items: rentalFormData.products.map((p) => ({ productId: p.productId, productName: p.productName, quantity: p.qty })),
      rentalDays: rentalFormData.days,
      startDate: fmt(start),
      dueDate: fmt(end),
      rentalFee: Math.round(totalRentalFee),
      deposit: Math.round(totalDeposit),
      penalty: 0,
      status: "active",
      operator: "店员小陈",
      createdAt: fmt(start),
    });
    setShowRentalForm(false);
  };

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">租借管理</h1>
          <p className="text-sm text-text-secondary mt-1">
            {members.length} 位会员 · 押金池 ¥{members.reduce((s, m) => s + m.depositBalance, 0)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setShowMemberForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            新增会员
          </button>
          <button className="btn-primary" onClick={() => setShowRentalForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建租借
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "活跃会员", val: members.filter((m) => m.status === "active").length, sub: "本月新增 5", cls: "from-primary-500 to-orange-500", icon: Users },
          { label: "在租单", val: rentalOrders.filter((r) => r.status === "active" || r.status === "overdue").length, sub: "逾期 2 单", cls: "from-secondary-500 to-blue-500", icon: KeyRound },
          { label: "押金总额", val: `¥${members.reduce((s, m) => s + m.depositBalance, 0).toLocaleString()}`, sub: "在池押金", cls: "from-emerald-500 to-teal-500", icon: Wallet },
          { label: "逾期罚金", val: `¥${rentalOrders.reduce((s, r) => s + r.penalty, 0)}`, sub: "本月 ¥85", cls: "from-warning to-red-500", icon: AlertCircle },
        ].map((s, i) => {
          const SIcon = s.icon;
          return (
            <div key={i} className="card !p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md", s.cls)}>
                  <SIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">{s.val}</div>
              <div className="text-xs text-text-secondary mt-1">{s.label} · {s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="w-80 card-sm flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                className="input pl-10 py-2"
                placeholder="搜索会员..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1">
            {filteredMembers.map((m) => {
              const lvl = levelConfig[m.level];
              const LvlIcon = lvl.icon;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all border-2",
                    activeMember === m.id
                      ? "bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-400 shadow-sm"
                      : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => setActiveMember(m.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm",
                      m.level === "platinum" && "bg-gradient-to-br from-purple-500 to-purple-700",
                      m.level === "gold" && "bg-gradient-to-br from-amber-400 to-amber-600",
                      m.level === "silver" && "bg-gradient-to-br from-slate-400 to-slate-600",
                      m.level === "normal" && "bg-gradient-to-br from-gray-400 to-gray-600",
                    )}>
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-text-primary truncate">{m.name}</span>
                        <span className={cn("badge !text-[9px] !py-0.5", lvl.cls)}>{lvl.label}</span>
                      </div>
                      <div className="text-[11px] text-text-tertiary truncate">
                        {m.memberNo} · {m.phone}
                      </div>
                    </div>
                    {m.status === "frozen" && <Ban className="w-4 h-4 text-danger" />}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary">
                      <Wallet className="w-3 h-3 inline mr-1" />
                      押金 ¥{m.depositBalance}
                    </span>
                    <span className="text-text-secondary">
                      租借 {m.totalRentals} 次
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {currentMember && (
            <div className="card-sm !bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                    {currentMember.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{currentMember.name}</h3>
                      <span className="px-2 py-0.5 rounded-lg bg-white/20 text-xs font-medium">
                        {levelConfig[currentMember.level].label}会员
                      </span>
                    </div>
                    <div className="text-white/80 text-sm mt-1 flex items-center gap-4">
                      <span>{currentMember.memberNo}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {currentMember.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-right">
                    <div className="text-xs text-white/70">押金余额</div>
                    <div className="text-2xl font-bold">¥{currentMember.depositBalance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/70">累计租借</div>
                    <div className="text-2xl font-bold">{currentMember.totalRentals}</div>
                  </div>
                  <button className="btn-ghost !bg-white/15 !text-white hover:!bg-white/25 !px-3" onClick={() => setShowMemberForm(true)}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card flex-1 overflow-auto scrollbar-thin min-h-0">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-primary-500"></div>
                <h3 className="text-base font-bold text-text-primary">
                  {currentMember ? `${currentMember.name}的租借记录` : "租借订单"}
                </h3>
                <span className="badge bg-primary-100 text-primary-700">
                  {currentMember ? memberRentals.length : activeRentals.length}
                </span>
              </div>
              {!currentMember && (
                <div className="inline-flex bg-gray-100 rounded-xl p-1">
                  <button
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      rentalTab === "active" ? "bg-white shadow-sm text-primary-700" : "text-text-secondary"
                    )}
                    onClick={() => setRentalTab("active")}
                  >
                    进行中
                  </button>
                  <button
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      rentalTab === "all" ? "bg-white shadow-sm text-primary-700" : "text-text-secondary"
                    )}
                    onClick={() => setRentalTab("all")}
                  >
                    全部记录
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(currentMember ? memberRentals : activeRentals).map((r) => {
                const st = statusConfig[r.status];
                return (
                  <div key={r.id} className="p-4 rounded-xl border-2 border-border hover:border-primary-200 transition-all bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                          r.status === "completed" ? "bg-emerald-100" : r.status === "overdue" ? "bg-red-100" : "bg-blue-100"
                        )}>
                          <KeyRound className={cn("w-5 h-5",
                            r.status === "completed" ? "text-emerald-600" : r.status === "overdue" ? "text-red-600" : "text-blue-600"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-sm">{r.orderNo}</span>
                            <span className={cn("badge", st.cls)}>{st.label}</span>
                          </div>
                          <div className="text-xs text-text-tertiary mt-0.5">
                            会员：{r.memberName} · 操作员：{r.operator}
                          </div>
                        </div>
                      </div>
                      {r.status === "active" || r.status === "overdue" ? (
                        <button className="btn-secondary btn-sm" onClick={() => handleReturn(r.id)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          归还
                        </button>
                      ) : (
                        <span className="text-xs text-text-tertiary">{r.returnDate}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.items.map((it, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-text-secondary">
                          {it.productName} × {it.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-xs pt-3 border-t border-border">
                      <div>
                        <div className="text-text-tertiary mb-0.5 flex items-center gap-1">
                          <CalendarClock className="w-3 h-3" /> 租期
                        </div>
                        <div className="font-medium text-text-primary">{r.rentalDays} 天</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary mb-0.5">租金</div>
                        <div className="font-medium text-primary-600">¥{r.rentalFee}</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary mb-0.5">押金</div>
                        <div className="font-medium text-secondary-600">¥{r.deposit}</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary mb-0.5">
                          {r.penalty > 0 ? "罚金" : "罚金"}
                        </div>
                        <div className={cn("font-medium", r.penalty > 0 ? "text-danger" : "text-text-tertiary")}>
                          {r.penalty > 0 ? `+¥${r.penalty}` : "¥0"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showRentalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40" onClick={() => setShowRentalForm(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-pop p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary-600" /> 新建租借单
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">选择会员 *</label>
                <select className="select" value={rentalFormData.memberId} onChange={(e) => setRentalFormData({ ...rentalFormData, memberId: e.target.value })}>
                  <option value="">请选择会员</option>
                  {members.filter((m) => m.status === "active").map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.memberNo}) - 押金 ¥{m.depositBalance}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">添加商品</label>
                <select
                  className="select mb-2"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const p = products.find((x) => x.id === e.target.value);
                    if (!p) return;
                    setRentalFormData({
                      ...rentalFormData,
                      products: [...rentalFormData.products, { productId: p.id, productName: p.name, rentalPrice: p.rentalPrice, qty: 1 }],
                    });
                  }}
                >
                  <option value="">+ 添加商品...</option>
                  {products.filter((p) => p.stock > 0).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - 租¥{p.rentalPrice}/天 (库存{p.stock})</option>
                  ))}
                </select>
                {rentalFormData.products.length > 0 && (
                  <div className="space-y-2">
                    {rentalFormData.products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <span className="flex-1 text-sm font-medium">{p.productName}</span>
                        <span className="text-xs text-text-secondary">¥{p.rentalPrice}/天</span>
                        <input type="number" className="input input-sm !w-16" value={p.qty} min="1"
                          onChange={(e) => {
                            const arr = [...rentalFormData.products];
                            arr[i].qty = Number(e.target.value);
                            setRentalFormData({ ...rentalFormData, products: arr });
                          }}
                        />
                        <button
                          className="w-7 h-7 rounded-lg hover:bg-red-100 text-danger flex items-center justify-center"
                          onClick={() => setRentalFormData({
                            ...rentalFormData,
                            products: rentalFormData.products.filter((_, idx) => idx !== i),
                          })}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label">租借天数</label>
                <div className="flex gap-2">
                  {[1, 3, 7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2",
                        rentalFormData.days === d
                          ? "bg-primary-500 border-primary-500 text-white shadow-md"
                          : "bg-white border-border text-text-secondary hover:border-primary-300"
                      )}
                      onClick={() => setRentalFormData({ ...rentalFormData, days: d })}
                    >
                      {d} 天
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-text-secondary">租金合计</span>
                  <span className="font-semibold text-primary-700">
                    ¥{rentalFormData.products.reduce((s, p) => s + p.rentalPrice * rentalFormData.days * p.qty, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">预估押金</span>
                  <span className="font-semibold text-secondary-700">
                    ¥{rentalFormData.products.reduce((s, p) => {
                      const prod = products.find((pr) => pr.id === p.productId);
                      return s + (prod?.costPrice || 100) * p.qty;
                    }, 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-outline" onClick={() => setShowRentalForm(false)}>取消</button>
              <button className="btn-primary" onClick={submitRental}>确认租借</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
