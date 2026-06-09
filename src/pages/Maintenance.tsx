import { useState, useMemo } from "react";
import { useAppStore } from "../store";
import { MaintenanceOrder } from "../types";
import {
  Wrench,
  Droplets,
  Plus,
  Search,
  Clock,
  User,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  X,
  Package,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

type MaintenanceStatus = "pending" | "processing" | "review" | "completed";

const statusConfig: Record<
  MaintenanceStatus,
  { label: string; color: string; bgColor: string; icon: typeof Clock }
> = {
  pending: { label: "待处理", color: "text-warning-600", bgColor: "bg-warning-50 border-warning-200", icon: Clock },
  processing: { label: "处理中", color: "text-secondary-600", bgColor: "bg-secondary-50 border-secondary-200", icon: Wrench },
  review: { label: "待验收", color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200", icon: FileText },
  completed: { label: "已完成", color: "text-success-600", bgColor: "bg-success-50 border-success-200", icon: CheckCircle2 },
};

const typeConfig = {
  clean: { label: "清洗", icon: Droplets, badge: "bg-info-100 text-info-700" },
  repair: { label: "维修", icon: Wrench, badge: "bg-warning-100 text-warning-700" },
};

const statusOrder: MaintenanceStatus[] = ["pending", "processing", "review", "completed"];

export default function Maintenance() {
  const { maintenanceOrders, employees, updateMaintenance, addMaintenance } = useAppStore();
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "clean" | "repair">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<MaintenanceOrder | null>(null);
  const [selectedAssign, setSelectedAssign] = useState<string>("");

  const filteredOrders = useMemo(() => {
    return maintenanceOrders.filter((o) => {
      const matchSearch =
        !searchText ||
        o.orderNo?.includes(searchText) ||
        (o.productName && o.productName.includes(searchText)) ||
        (o.customerName && o.customerName.includes(searchText));
      const matchType = typeFilter === "all" || o.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [maintenanceOrders, searchText, typeFilter]);

  const groupedOrders = useMemo(() => {
    const groups: Record<MaintenanceStatus, MaintenanceOrder[]> = {
      pending: [],
      processing: [],
      review: [],
      completed: [],
    };
    filteredOrders.forEach((o) => groups[o.status].push(o));
    return groups;
  }, [filteredOrders]);

  const moveToNextStatus = (order: MaintenanceOrder) => {
    const currentIdx = statusOrder.indexOf(order.status);
    if (currentIdx < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIdx + 1];
      updateMaintenance(order.id, { status: nextStatus });
    }
  };

  const assignWorker = (orderId: string) => {
    if (selectedAssign) {
      updateMaintenance(orderId, { assignee: selectedAssign });
      setSelectedAssign("");
      setShowDetailModal(null);
    }
  };

  const [formData, setFormData] = useState({
    type: "repair" as "clean" | "repair",
    productName: "",
    description: "",
    customerName: "",
    customerPhone: "",
    expectedDate: "",
    assignee: "",
  });

  const submitCreate = () => {
    if (!formData.productName || !formData.description) return;
    const date = new Date();
    const orderNo = `MT${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 900) + 100)}`;
    addMaintenance({
      id: `mt${Date.now()}`,
      orderNo,
      type: formData.type,
      productName: formData.productName,
      description: formData.description,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      expectedDate: formData.expectedDate || undefined,
      assignee: formData.assignee || undefined,
      status: "pending",
      operator: "店长-李明",
      createdAt: date.toISOString().slice(0, 19).replace("T", " "),
    });
    setShowCreateModal(false);
    setFormData({ type: "repair", productName: "", description: "", customerName: "", customerPhone: "", expectedDate: "", assignee: "" });
  };

  const overdueOrders = maintenanceOrders.filter(
    (o) => o.status !== "completed" && o.expectedDate && new Date(o.expectedDate) < new Date()
  ).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-900">清洗维修</h1>
          <p className="text-sm text-text-500 mt-1">管理玩具清洗消毒与维修工单，看板跟踪全流程</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-400" />
            <input
              placeholder="搜索工单号、商品、客户..."
              className="input pl-10 w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <select
            className="select w-32"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">全部类型</option>
            <option value="clean">清洗</option>
            <option value="repair">维修</option>
          </select>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            新建工单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "总工单", value: maintenanceOrders.length, icon: Wrench, color: "from-primary-500 to-primary-400" },
          { label: "待处理", value: groupedOrders.pending.length, icon: Clock, color: "from-warning-500 to-warning-400" },
          { label: "处理中", value: groupedOrders.processing.length, icon: Package, color: "from-secondary-500 to-secondary-400" },
          { label: "逾期预警", value: overdueOrders, icon: AlertTriangle, color: "from-danger-500 to-danger-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="card-sm p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-sm`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-900">{kpi.value}</div>
              <div className="text-xs text-text-500 mt-0.5">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statusOrder.map((status) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          const orders = groupedOrders[status];
          return (
            <div key={status} className="card-sm p-4 flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-100">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bgColor} border flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-text-900 text-sm">{cfg.label}</div>
                    <div className="text-xs text-text-500">{orders.length} 条</div>
                  </div>
                </div>
                {status !== "completed" && (
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin pr-1">
                {orders.map((order) => {
                  const typeCfg = typeConfig[order.type];
                  const TypeIcon = typeCfg.icon;
                  const isOverdue = order.expectedDate && new Date(order.expectedDate) < new Date() && status !== "completed";
                  return (
                    <div
                      key={order.id}
                      className={`rounded-xl border p-3 cursor-pointer transition-all hover:shadow-pop hover:-translate-y-0.5 ${
                        isOverdue ? "border-danger-200 bg-danger-50/50" : "border-border-100 bg-white"
                      }`}
                      onClick={() => setShowDetailModal(order)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono text-text-500">{order.orderNo}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${typeCfg.badge}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeCfg.label}
                        </span>
                      </div>
                      <div className="font-medium text-text-900 text-sm mb-1 line-clamp-1">{order.productName || "（未填写商品名）"}</div>
                      <p className="text-xs text-text-500 line-clamp-2 mb-3 min-h-[32px]">{order.description}</p>

                      {order.customerName && (
                        <div className="flex items-center gap-1 text-xs text-text-600 mb-1.5">
                          <User className="w-3 h-3" />
                          <span>{order.customerName}</span>
                          {order.customerPhone && <span className="text-text-400">· {order.customerPhone}</span>}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border-50">
                        <div className="flex items-center gap-1 text-xs text-text-500">
                          <User className="w-3 h-3" />
                          <span className={order.assignee ? "text-text-700" : "text-text-400"}>
                            {order.assignee || "未分派"}
                          </span>
                        </div>
                        {order.expectedDate && (
                          <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-danger-600 font-medium" : "text-text-500"}`}>
                            <Calendar className="w-3 h-3" />
                            <span>{order.expectedDate.slice(5)}</span>
                          </div>
                        )}
                      </div>

                      {isOverdue && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-danger-600 bg-danger-100 rounded-md px-2 py-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>已逾期</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div className="text-center py-12 text-text-400 text-sm">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    暂无工单
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in-up p-4">
          <div className="bg-white rounded-2xl shadow-pop w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-100">
              <h3 className="font-semibold text-text-900 text-lg">新建工单</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-text-400 hover:text-text-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">工单类型</label>
                  <select
                    className="select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="repair">维修</option>
                    <option value="clean">清洗</option>
                  </select>
                </div>
                <div>
                  <label className="label">期望完成</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">商品名称 *</label>
                <input
                  className="input"
                  placeholder="请输入商品名称"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">问题描述 *</label>
                <textarea
                  className="input min-h-[90px] resize-none"
                  placeholder="详细描述问题，如：遥控失灵、车轮卡滞、需要深度消毒..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">客户姓名</label>
                  <input
                    className="input"
                    placeholder="选填"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">客户电话</label>
                  <input
                    className="input"
                    placeholder="选填"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">分派人员</label>
                <select
                  className="select"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                >
                  <option value="">暂不分派</option>
                  {employees.filter(e => e.role !== "manager").map((e) => (
                    <option key={e.id} value={e.name}>{e.name} · {e.role === "cleaner" ? "清洗员" : "店员"}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-background-50 border-t border-border-100 flex justify-end gap-3">
              <button className="btn-outline" onClick={() => setShowCreateModal(false)}>取消</button>
              <button className="btn-primary" onClick={submitCreate}>创建工单</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in-up p-4">
          <div className="bg-white rounded-2xl shadow-pop w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${statusConfig[showDetailModal.status].bgColor} border flex items-center justify-center`}>
                  {(() => {
                    const Ic = statusConfig[showDetailModal.status].icon;
                    return <Ic className={`w-5 h-5 ${statusConfig[showDetailModal.status].color}`} />;
                  })()}
                </div>
                <div>
                  <div className="font-semibold text-text-900">{showDetailModal.orderNo}</div>
                  <div className={`text-xs ${statusConfig[showDetailModal.status].color} font-medium`}>
                    {statusConfig[showDetailModal.status].label} · {typeConfig[showDetailModal.type].label}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="text-text-400 hover:text-text-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-xs text-text-500 mb-1">商品名称</div>
                  <div className="font-medium text-text-900">{showDetailModal.productName || "（未填写商品名）"}</div>
                </div>
                <div>
                  <div className="text-xs text-text-500 mb-1">期望完成</div>
                  <div className="font-medium text-text-900">{showDetailModal.expectedDate || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-text-500 mb-1">客户姓名</div>
                  <div className="font-medium text-text-900">{showDetailModal.customerName || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-text-500 mb-1">客户电话</div>
                  <div className="font-medium text-text-900">{showDetailModal.customerPhone || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-text-500 mb-1">当前负责</div>
                  <div className="font-medium text-text-900">{showDetailModal.assignee || "未分派"}</div>
                </div>
                <div>
                  <div className="text-xs text-text-500 mb-1">登记时间</div>
                  <div className="font-medium text-text-900">{showDetailModal.createdAt}</div>
                </div>
              </div>
              <div className="card-sm p-4 bg-background-50">
                <div className="text-xs text-text-500 mb-2">问题描述</div>
                <div className="text-sm text-text-800 leading-relaxed">{showDetailModal.description}</div>
              </div>

              {showDetailModal.status === "pending" && (
                <div>
                  <div className="text-xs text-text-500 mb-2">分派人员</div>
                  <div className="flex gap-2">
                    <select className="select flex-1" value={selectedAssign} onChange={(e) => setSelectedAssign(e.target.value)}>
                      <option value="">请选择人员...</option>
                      {employees.filter(e => e.role !== "manager").map((e) => (
                        <option key={e.id} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                    <button className="btn-secondary flex items-center gap-1" onClick={() => assignWorker(showDetailModal.id)}>
                      <User className="w-4 h-4" />
                      分派
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-background-50 border-t border-border-100 flex justify-between items-center">
              <div className="text-xs text-text-500 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full inline-block ${
                  showDetailModal.status === "pending" ? "bg-warning-500" :
                  showDetailModal.status === "processing" ? "bg-secondary-500" :
                  showDetailModal.status === "review" ? "bg-purple-500" : "bg-success-500"
                }`}></span>
                状态：{statusConfig[showDetailModal.status].label}
              </div>
              <div className="flex gap-3">
                <button className="btn-outline" onClick={() => setShowDetailModal(null)}>关闭</button>
                {showDetailModal.status !== "completed" && (
                  <button
                    className="btn-primary flex items-center gap-1"
                    onClick={() => {
                      moveToNextStatus(showDetailModal);
                      setShowDetailModal({ ...showDetailModal, status: statusOrder[statusOrder.indexOf(showDetailModal.status) + 1] });
                    }}
                  >
                    {showDetailModal.status === "pending" && <>开始处理 <ArrowRight className="w-4 h-4" /></>}
                    {showDetailModal.status === "processing" && <>提交验收 <ArrowRight className="w-4 h-4" /></>}
                    {showDetailModal.status === "review" && <>确认完成 <CheckCircle2 className="w-4 h-4" /></>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
