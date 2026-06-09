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
  X,
  Gift,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const levelConfig: Record<string, { label: string; cls: string; icon: any; deposit: number }> = {
  normal: { label: "普通", cls: "bg-gray-100 text-gray-700", icon: Users, deposit: 200 },
  silver: { label: "银卡", cls: "bg-slate-100 text-slate-700", icon: Sparkles, deposit: 500 },
  gold: { label: "金卡", cls: "bg-amber-100 text-amber-700", icon: Crown, deposit: 1000 },
  platinum: { label: "铂金", cls: "bg-purple-100 text-purple-700", icon: Crown, deposit: 2000 },
};

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  active: { label: "租借中", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  overdue: { label: "已逾期", cls: "bg-danger-100 text-danger-700", dot: "bg-danger-500" },
  completed: { label: "已完成", cls: "bg-success-100 text-success-700", dot: "bg-success-500" },
  returned: { label: "已归还", cls: "bg-gray-100 text-gray-700", dot: "bg-gray-500" },
  pending: { label: "待生效", cls: "bg-warning-100 text-warning-700", dot: "bg-warning-500" },
};

const PENALTY_PER_DAY = 20;

export default function Rental() {
  const {
    members,
    rentalOrders,
    products,
    updateMember,
    updateRental,
    addMember,
    addRental,
    updateProduct,
    addStockRecord,
  } = useAppStore();

  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [rentalTab, setRentalTab] = useState<"active" | "all">("active");
  const [showMemberForm, setShowMemberForm] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    level: "normal" as "normal" | "silver" | "gold" | "platinum",
    deposit: 200,
  });
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

  const calcPenalty = (rental: any) => {
    if (rental.status !== "active" && rental.status !== "overdue") return rental.penalty;
    const due = new Date(rental.dueDate);
    const now = new Date();
    const msPerDay = 24 * 3600 * 1000;
    const days = Math.floor((now.getTime() - due.getTime()) / msPerDay);
    if (days <= 0) return 0;
    return days * PENALTY_PER_DAY * rental.items.reduce((s: number, it: any) => s + it.quantity, 0);
  };

  const submitMemberForm = () => {
    if (!memberForm.name.trim() || !memberForm.phone.trim()) return;
    if (showMemberForm?.mode === "add") {
      const date = new Date();
      const no = `M${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 9000) + 1000)}`;
      addMember({
        id: `m${Date.now()}`,
        memberNo: no,
        name: memberForm.name.trim(),
        phone: memberForm.phone.trim(),
        level: memberForm.level,
        depositBalance: Number(memberForm.deposit) || 0,
        totalRentals: 0,
        status: "active",
        joinDate: date.toISOString().slice(0, 10),
      });
    } else if (showMemberForm?.mode === "edit" && showMemberForm.data) {
      updateMember(showMemberForm.data.id, {
        name: memberForm.name.trim(),
        phone: memberForm.phone.trim(),
        level: memberForm.level,
      });
      if (activeMember === showMemberForm.data.id) {
        const diff = Number(memberForm.deposit) || 0;
        if (diff > 0) {
          const m = members.find((x) => x.id === showMemberForm.data.id);
          if (m) updateMember(m.id, { depositBalance: m.depositBalance + diff });
        }
      }
    }
    setShowMemberForm(null);
    setMemberForm({ name: "", phone: "", level: "normal", deposit: 200 });
  };

  const openMemberForm = (mode: "add" | "edit", data?: any) => {
    if (mode === "edit" && data) {
      setMemberForm({
        name: data.name,
        phone: data.phone,
        level: data.level,
        deposit: 0,
      });
    } else {
      setMemberForm({ name: "", phone: "", level: "normal", deposit: levelConfig.normal.deposit });
    }
    setShowMemberForm({ mode, data });
  };

  const openReturnConfirm = (rental: any) => {
    const penalty = calcPenalty(rental);
    const member = members.find((m) => m.id === rental.memberId);
    const refund = Math.max(0, rental.deposit - penalty);
    setShowReturnConfirm({ rental, penalty, member, refund });
  };

  const confirmReturn = () => {
    const { rental, penalty, refund, member } = showReturnConfirm;
    const returnDate = new Date().toISOString().slice(0, 16).replace("T", " ");
    const finalStatus = penalty > rental.deposit ? "returned" : "completed";

    rental.items.forEach((it: any) => {
      const p = products.find((x) => x.id === it.productId);
      if (p) {
        addStockRecord({
          id: `stk${Date.now()}-${it.productId}`,
          type: "rental_in",
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          beforeStock: p.stock,
          afterStock: p.stock + it.quantity,
          relatedOrderNo: rental.orderNo,
          operator: "店员小陈",
          remark: penalty > 0 ? `归还 · 罚金¥${penalty}` : "正常归还",
          createdAt: returnDate,
        });
        updateProduct(p.id, { stock: p.stock + it.quantity });
      }
    });

    updateRental(rental.id, {
      status: finalStatus,
      returnDate,
      penalty,
    });

    const targetMember = member || members.find((m) => m.id === rental.memberId);
    if (targetMember) {
      updateMember(targetMember.id, {
        depositBalance: targetMember.depositBalance + refund,
        totalRentals: targetMember.totalRentals + 1,
      });
    }

    setShowReturnConfirm(null);
  };

  const submitRental = () => {
    if (!rentalFormData.memberId || rentalFormData.products.length === 0) return;
    const member = members.find((m) => m.id === rentalFormData.memberId);
    const totalRentalFee = rentalFormData.products.reduce(
      (s, p) => s + p.rentalPrice * rentalFormData.days * p.qty,
      0
    );
    const totalDeposit = rentalFormData.products.reduce((s, p) => {
      const prod = products.find((pr) => pr.id === p.productId);
      return s + (prod?.costPrice || 100) * p.qty;
    }, 0);
    if (member && totalDeposit > member.depositBalance) {
      alert(`押金不足！需要 ¥${totalDeposit}，当前余额 ¥${member.depositBalance}`);
      return;
    }
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + rentalFormData.days);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const rentalOrderNo = `R${new Date().getFullYear()}${pad(new Date().getMonth() + 1)}${pad(new Date().getDate())}${Math.floor(Math.random() * 900 + 100)}`;

    rentalFormData.products.forEach((it) => {
      const p = products.find((x) => x.id === it.productId);
      if (p) {
        addStockRecord({
          id: `stk${Date.now()}-${it.productId}`,
          type: "rental_out",
          productId: it.productId,
          productName: it.productName,
          quantity: it.qty,
          beforeStock: p.stock,
          afterStock: Math.max(0, p.stock - it.qty),
          relatedOrderNo: rentalOrderNo,
          operator: "店员小陈",
          remark: `租借${rentalFormData.days}天，会员${member?.name || ""}`,
          createdAt: fmt(start),
        });
        updateProduct(p.id, { stock: Math.max(0, p.stock - it.qty) });
      }
    });

    if (member) {
      updateMember(member.id, { depositBalance: member.depositBalance - totalDeposit });
    }

    addRental({
      id: `r${Date.now()}`,
      orderNo: rentalOrderNo,
      memberId: rentalFormData.memberId,
      memberName: member?.name || "",
      items: rentalFormData.products.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.qty,
      })),
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
    setRentalFormData({ memberId: "", products: [], days: 3 });
  };

  const renderRentalCard = (r: any) => {
    const st = statusConfig[r.status];
    const penalty = calcPenalty(r);
    const isOverdue = penalty > 0 && (r.status === "active" || r.status === "overdue");
    return (
      <div
        key={r.id}
        className={cn(
          "p-4 rounded-xl border-2 transition-all bg-white",
          isOverdue ? "border-danger-200 bg-danger-50/30" : "border-border-100 hover:border-primary-200"
        )}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                r.status === "completed" || r.status === "returned"
                  ? "bg-success-100"
                  : isOverdue
                  ? "bg-danger-100"
                  : "bg-secondary-100"
              )}
            >
              <KeyRound
                className={cn(
                  "w-5 h-5",
                  r.status === "completed" || r.status === "returned"
                    ? "text-success-600"
                    : isOverdue
                    ? "text-danger-600"
                    : "text-secondary-600"
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-semibold text-sm text-text-900">{r.orderNo}</span>
                <span className={cn("badge", st.cls)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full inline-block mr-1", st.dot)} />
                  {st.label}
                </span>
                {isOverdue && (
                  <span className="badge badge-danger flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />罚金 ¥{penalty}
                  </span>
                )}
              </div>
              <div className="text-xs text-text-500 mt-0.5">
                会员：{r.memberName} · 操作员：{r.operator}
              </div>
            </div>
          </div>
          {r.status === "active" || r.status === "overdue" ? (
            <button className="btn-secondary flex items-center gap-1.5" onClick={() => openReturnConfirm(r)}>
              <RotateCcw className="w-4 h-4" />
              归还结算
            </button>
          ) : (
            <div className="text-right">
              <div className="text-xs text-text-500">归还时间</div>
              <div className="text-sm font-medium text-text-700">{r.returnDate || "-"}</div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {r.items.map((it: any, i: number) => (
            <span key={i} className="px-2.5 py-1 bg-background-50 border border-border-100 rounded-lg text-xs text-text-700">
              <Gift className="w-3 h-3 inline mr-1" />
              {it.productName} × <span className="font-semibold text-primary-600">{it.quantity}</span>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-3 text-xs pt-3 border-t border-border-100">
          <div>
            <div className="text-text-500 mb-0.5 flex items-center gap-1">
              <CalendarClock className="w-3 h-3" /> 租期
            </div>
            <div className="font-medium text-text-900">{r.rentalDays} 天</div>
            <div className="text-[10px] text-text-400 mt-0.5">
              {r.startDate?.slice(5, 10)} ~ {r.dueDate?.slice(5, 10)}
            </div>
          </div>
          <div>
            <div className="text-text-500 mb-0.5">租金</div>
            <div className="font-medium text-primary-600">¥{r.rentalFee}</div>
          </div>
          <div>
            <div className="text-text-500 mb-0.5">押金</div>
            <div className="font-medium text-secondary-600">¥{r.deposit}</div>
          </div>
          <div>
            <div className="text-text-500 mb-0.5">罚金</div>
            <div className={cn("font-medium", penalty > 0 ? "text-danger-600" : "text-text-400")}>
              {penalty > 0 ? `¥${penalty}` : "-"}
            </div>
          </div>
          <div>
            <div className="text-text-500 mb-0.5">退还押金</div>
            <div className="font-semibold text-success-600">¥{Math.max(0, r.deposit - penalty)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-900">租借管理</h1>
          <p className="text-sm text-text-500 mt-1">
            {members.length} 位会员 · 押金池 ¥{members.reduce((s, m) => s + m.depositBalance, 0).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2" onClick={() => openMemberForm("add")}>
            <UserPlus className="w-4 h-4" />
            新增会员
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowRentalForm(true)}>
            <Plus className="w-4 h-4" />
            新建租借
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "活跃会员",
            val: members.filter((m) => m.status === "active").length,
            sub: "累计 " + members.length,
            cls: "from-primary-500 to-orange-500",
            icon: Users,
          },
          {
            label: "在租单",
            val: rentalOrders.filter((r) => r.status === "active" || r.status === "overdue").length,
            sub: "逾期 " + rentalOrders.filter((r) => r.status === "overdue" || calcPenalty(r) > 0).length + " 单",
            cls: "from-secondary-500 to-blue-500",
            icon: KeyRound,
          },
          {
            label: "押金总额",
            val: `¥${members.reduce((s, m) => s + m.depositBalance, 0).toLocaleString()}`,
            sub: "在池押金",
            cls: "from-success-500 to-teal-500",
            icon: Wallet,
          },
          {
            label: "累计罚金",
            val: `¥${rentalOrders.reduce((s, r) => s + r.penalty, 0)}`,
            sub: `每日 ¥${PENALTY_PER_DAY}/件`,
            cls: "from-warning to-red-500",
            icon: AlertCircle,
          },
        ].map((s, i) => {
          const SIcon = s.icon;
          return (
            <div key={i} className="card-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm",
                    s.cls
                  )}
                >
                  <SIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-900">{s.val}</div>
              <div className="text-xs text-text-500 mt-0.5">{s.label} · {s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        <div className="w-full lg:w-80 card-sm flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-3 border-b border-border-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-400" />
              <input
                className="input pl-10 py-2 text-sm"
                placeholder="搜索姓名/电话/会员号"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 max-h-[65vh] overflow-auto scrollbar-thin p-2 space-y-1.5">
            {filteredMembers.length === 0 && (
              <div className="text-center py-10 text-text-400 text-sm">暂无会员</div>
            )}
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
                      : "bg-white border-transparent hover:border-border-200 hover:bg-background-50"
                  )}
                  onClick={() => setActiveMember(m.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm",
                        m.level === "platinum" && "bg-gradient-to-br from-purple-500 to-purple-700",
                        m.level === "gold" && "bg-gradient-to-br from-amber-400 to-amber-600",
                        m.level === "silver" && "bg-gradient-to-br from-slate-400 to-slate-600",
                        m.level === "normal" && "bg-gradient-to-br from-gray-400 to-gray-600"
                      )}
                    >
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-text-900 truncate">{m.name}</span>
                        <span className={cn("badge !text-[10px] !py-0.5", lvl.cls)}>
                          <LvlIcon className="w-3 h-3 inline mr-0.5" />
                          {lvl.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-500 truncate mt-0.5">
                        {m.memberNo} · {m.phone}
                      </div>
                    </div>
                    {m.status === "frozen" && <Ban className="w-4 h-4 text-danger" />}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-border-50">
                    <span className="text-text-600 flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-text-400" />
                      押金 <span className="font-semibold text-secondary-600">¥{m.depositBalance}</span>
                    </span>
                    <span className="text-text-600">
                      租借 <span className="font-semibold text-text-900">{m.totalRentals}</span> 次
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {currentMember && (
            <div className="card-sm !bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10"></div>
              <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/5"></div>
              <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                    {currentMember.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold">{currentMember.name}</h3>
                      <span className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium flex items-center gap-1">
                        {(() => {
                          const L = levelConfig[currentMember.level];
                          const LI = L.icon;
                          return <><LI className="w-3 h-3" />{L.label}会员</>;
                        })()}
                      </span>
                      {currentMember.status === "frozen" && (
                        <span className="px-2.5 py-1 rounded-lg bg-danger/80 text-xs font-medium">已冻结</span>
                      )}
                    </div>
                    <div className="text-white/80 text-sm mt-1 flex items-center gap-4 flex-wrap">
                      <span>{currentMember.memberNo}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {currentMember.phone}
                      </span>
                      <span className="text-[11px] text-white/60">入会 {currentMember.joinDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="text-right">
                    <div className="text-xs text-white/70">押金余额</div>
                    <div className="text-2xl font-bold">¥{currentMember.depositBalance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/70">累计租借</div>
                    <div className="text-2xl font-bold">{currentMember.totalRentals}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 transition"
                      onClick={() => openMemberForm("edit", currentMember)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>
                <h3 className="text-base font-bold text-text-900">
                  {currentMember ? `${currentMember.name}的租借记录` : "租借订单"}
                </h3>
                <span className="badge badge-info">
                  <Receipt className="w-3 h-3 inline mr-1" />
                  {currentMember ? memberRentals.length : activeRentals.length} 条
                </span>
              </div>
              {!currentMember && (
                <div className="inline-flex bg-background-50 rounded-xl p-1">
                  <button
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      rentalTab === "active"
                        ? "bg-white shadow-sm text-primary-700 border border-border-100"
                        : "text-text-500"
                    )}
                    onClick={() => setRentalTab("active")}
                  >
                    进行中
                  </button>
                  <button
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      rentalTab === "all"
                        ? "bg-white shadow-sm text-primary-700 border border-border-100"
                        : "text-text-500"
                    )}
                    onClick={() => setRentalTab("all")}
                  >
                    全部记录
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-auto scrollbar-thin pr-1">
              {(currentMember ? memberRentals : activeRentals).length === 0 && (
                <div className="text-center py-16 text-text-400">
                  <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  暂无租借记录
                </div>
              )}
              {(currentMember ? memberRentals : activeRentals).map(renderRentalCard)}
            </div>
          </div>
        </div>
      </div>

      {/* ============ 新增/编辑会员 ============ */}
      {showMemberForm && (
        <Modal
          title={showMemberForm.mode === "add" ? "新增会员" : "编辑会员"}
          onClose={() => setShowMemberForm(null)}
        >
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">会员姓名 *</label>
                  <input
                    className="input"
                    placeholder="请输入姓名"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">联系电话 *</label>
                  <input
                    className="input"
                    placeholder="请输入手机号"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">会员等级</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(levelConfig) as any).map((lv: any) => {
                    const lc = levelConfig[lv];
                    const LcIcon = lc.icon;
                    return (
                      <button
                        key={lv}
                        type="button"
                        onClick={() =>
                          setMemberForm({
                            ...memberForm,
                            level: lv,
                            deposit: showMemberForm.mode === "add" ? lc.deposit : memberForm.deposit,
                          })
                        }
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          memberForm.level === lv
                            ? "border-primary-500 bg-primary-50 shadow-sm"
                            : "border-border-100 hover:border-border-300 bg-white"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 mx-auto mb-1.5 rounded-lg flex items-center justify-center",
                            lc.cls
                          )}
                        >
                          <LcIcon className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-medium text-text-900">{lc.label}</div>
                        <div className="text-[11px] text-text-500 mt-0.5">
                          {showMemberForm.mode === "add" ? `押${lc.deposit}` : "当前等级"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="label">
                  {showMemberForm.mode === "add" ? "初始充值押金" : "追加充值押金（选填）"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-500 font-semibold">¥</span>
                  <input
                    type="number"
                    min="0"
                    className="input pl-8"
                    value={memberForm.deposit}
                    onChange={(e) => setMemberForm({ ...memberForm, deposit: Number(e.target.value) })}
                  />
                </div>
                {showMemberForm.mode === "edit" && showMemberForm.data && (
                  <p className="text-xs text-text-500 mt-1.5">
                    当前余额：¥{members.find((m) => m.id === showMemberForm.data.id)?.depositBalance || 0}，
                    追加后将变为：¥{(members.find((m) => m.id === showMemberForm.data.id)?.depositBalance || 0) + (Number(memberForm.deposit) || 0)}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowMemberForm(null)}>取消</button>
            <button className="btn-primary flex items-center gap-1.5" onClick={submitMemberForm}>
              <CheckCircle2 className="w-4 h-4" />
              {showMemberForm.mode === "add" ? "创建会员" : "保存修改"}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ============ 归还确认 ============ */}
      {showReturnConfirm && (
        <Modal title="归还结算确认" onClose={() => setShowReturnConfirm(null)}>
          <ModalBody>
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <div className="font-mono font-semibold text-text-900">{showReturnConfirm.rental.orderNo}</div>
                  <div className="text-xs text-text-500">
                    会员：{showReturnConfirm.rental.memberName}
                    {showReturnConfirm.member && ` · 当前押金 ¥${showReturnConfirm.member.depositBalance}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {showReturnConfirm.rental.items.map((it: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white/80 border border-border-100 text-xs">
                    {it.productName} × {it.quantity}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <BillRow label="租期" value={`${showReturnConfirm.rental.rentalDays} 天 (${showReturnConfirm.rental.startDate?.slice(5,10)} ~ ${showReturnConfirm.rental.dueDate?.slice(5,10)})`} />
              <BillRow label="租金（已收取）" value={`¥${showReturnConfirm.rental.rentalFee}`} />
              <BillRow label="冻结押金" value={`¥${showReturnConfirm.rental.deposit}`} />
              <BillRow
                label="逾期罚金"
                value={`¥${showReturnConfirm.penalty}`}
                warn={showReturnConfirm.penalty > 0}
              />
              <div className="border-t border-border-100 my-3"></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-success-50 border border-success-200">
                <div className="flex items-center gap-2 text-success-800">
                  <ArrowRight className="w-4 h-4" />
                  <span className="font-medium">退还会员押金</span>
                </div>
                <div className="text-2xl font-bold text-success-700">¥{showReturnConfirm.refund}</div>
              </div>
              {showReturnConfirm.refund === 0 && showReturnConfirm.penalty > showReturnConfirm.rental.deposit && (
                <p className="text-xs text-danger-600 bg-danger-50 p-2.5 rounded-lg border border-danger-100">
                  ⚠️ 罚金超过押金，请向客户另行收取 ¥{showReturnConfirm.penalty - showReturnConfirm.rental.deposit}
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowReturnConfirm(null)}>再看看</button>
            <button className="btn-primary flex items-center gap-1.5" onClick={confirmReturn}>
              <RotateCcw className="w-4 h-4" />
              确认归还
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ============ 新建租借 ============ */}
      {showRentalForm && (
        <Modal title="新建租借单" onClose={() => setShowRentalForm(false)} size="lg">
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="label">选择会员 *</label>
                <select
                  className="select"
                  value={rentalFormData.memberId}
                  onChange={(e) => setRentalFormData({ ...rentalFormData, memberId: e.target.value })}
                >
                  <option value="">请选择会员</option>
                  {members
                    .filter((m) => m.status === "active")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.memberNo}) - 押金 ¥{m.depositBalance} - {levelConfig[m.level].label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label">添加租借商品（库存可用）</label>
                <select
                  className="select mb-2"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const p = products.find((x) => x.id === e.target.value);
                    if (!p) return;
                    setRentalFormData({
                      ...rentalFormData,
                      products: [
                        ...rentalFormData.products,
                        { productId: p.id, productName: p.name, rentalPrice: p.rentalPrice, qty: 1 },
                      ],
                    });
                  }}
                >
                  <option value="">+ 添加商品...</option>
                  {products
                    .filter((p) => p.stock > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - 租¥{p.rentalPrice}/天 (库存{p.stock})
                      </option>
                    ))}
                </select>
                {rentalFormData.products.length > 0 && (
                  <div className="space-y-2">
                    {rentalFormData.products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background-50 border border-border-100">
                        <span className="flex-1 text-sm font-medium text-text-900">{p.productName}</span>
                        <span className="text-xs text-text-500">¥{p.rentalPrice}/天</span>
                        <input
                          type="number"
                          className="input !w-20 !py-1.5 !text-sm"
                          value={p.qty}
                          min="1"
                          onChange={(e) => {
                            const arr = [...rentalFormData.products];
                            arr[i].qty = Number(e.target.value);
                            setRentalFormData({ ...rentalFormData, products: arr });
                          }}
                        />
                        <button
                          className="w-8 h-8 rounded-lg hover:bg-danger-50 text-text-400 hover:text-danger-600 flex items-center justify-center transition"
                          onClick={() =>
                            setRentalFormData({
                              ...rentalFormData,
                              products: rentalFormData.products.filter((_, idx) => idx !== i),
                            })
                          }
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label">租借天数</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 3, 7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={cn(
                        "flex-1 min-w-[72px] py-2.5 rounded-xl text-sm font-medium transition-all border-2",
                        rentalFormData.days === d
                          ? "bg-primary-500 border-primary-500 text-white shadow-md"
                          : "bg-white border-border-100 text-text-500 hover:border-primary-300"
                      )}
                      onClick={() => setRentalFormData({ ...rentalFormData, days: d })}
                    >
                      {d} 天
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-600">租金合计</span>
                  <span className="font-bold text-primary-700 text-lg">
                    ¥{rentalFormData.products.reduce((s, p) => s + p.rentalPrice * rentalFormData.days * p.qty, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-600">需冻结押金</span>
                  <span className="font-bold text-secondary-700 text-lg">
                    ¥{rentalFormData.products.reduce((s, p) => {
                      const prod = products.find((pr) => pr.id === p.productId);
                      return s + (prod?.costPrice || 100) * p.qty;
                    }, 0)}
                  </span>
                </div>
                {rentalFormData.memberId && (() => {
                  const m = members.find((x) => x.id === rentalFormData.memberId);
                  const dep = rentalFormData.products.reduce((s, p) => {
                    const prod = products.find((pr) => pr.id === p.productId);
                    return s + (prod?.costPrice || 100) * p.qty;
                  }, 0);
                  const ok = m && m.depositBalance >= dep;
                  return (
                    <div className={cn(
                      "text-xs pt-2 border-t border-primary-100/50 flex items-center gap-1.5",
                      ok ? "text-success-700" : "text-danger-600"
                    )}>
                      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {m ? (
                        ok
                          ? `会员 ${m.name} 押金充足（¥${m.depositBalance}）`
                          : `会员 ${m.name} 押金不足：余额 ¥${m.depositBalance}，需 ¥${dep}，差额 ¥${dep - m.depositBalance}`
                      ) : "请先选择会员"}
                    </div>
                  );
                })()}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn-outline" onClick={() => setShowRentalForm(false)}>取消</button>
            <button className="btn-primary flex items-center gap-1.5" onClick={submitRental}>
              <KeyRound className="w-4 h-4" />
              确认租借
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, size = "md" }: any) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full bg-white rounded-2xl shadow-pop overflow-hidden",
          size === "xl"
            ? "max-w-4xl"
            : size === "lg"
            ? "max-w-2xl"
            : "max-w-lg"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-100">
          <h2 className="text-lg font-bold text-text-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-background-50 text-text-400 hover:text-text-700 transition"
          >
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

function BillRow({ label, value, warn }: any) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-text-600">{label}</span>
      <span className={cn("font-semibold", warn ? "text-danger-600 text-lg" : "text-text-900")}>{value}</span>
    </div>
  );
}
