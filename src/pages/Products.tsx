import { useState } from "react";
import { useAppStore } from "@/store";
import {
  Plus,
  Search,
  Scan,
  Upload,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  X,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const ageRanges = ["0-3岁", "3-6岁", "6-12岁", "8-14岁", "10岁以上", "全年龄段"];

const tagColorMap: Record<string, string> = {
  热销: "bg-red-100 text-red-700",
  新品: "bg-blue-100 text-blue-700",
  推荐: "bg-green-100 text-green-700",
  限量: "bg-orange-100 text-orange-700",
  爆款: "bg-orange-100 text-orange-700",
  断货: "bg-gray-100 text-gray-700",
};

export default function Products() {
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const tags = useAppStore((s) => s.tags.filter((t) => t.type === "product"));
  const addProduct = useAppStore((s) => s.addProduct);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["cat1", "cat2", "cat3", "cat4", "cat5"]));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [scanMode, setScanMode] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    salePrice: 0,
    costPrice: 0,
    rentalPrice: 0,
    imageUrl: "",
    ageRange: "3-6岁",
    tags: [],
    stock: 0,
    safetyStock: 8,
    status: "active",
  });

  const rootCats = categories.filter((c) => !c.parentId);
  const subCats = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.includes(search) || p.sku.includes(search) || p.barcode.includes(search);
    const matchesCat = !activeCategory || p.categoryId === activeCategory || categories.find((c) => c.id === activeCategory && !c.parentId) ? activeCategory && (p.categoryId === activeCategory || categories.find((c) => c.id === p.categoryId)?.parentId === activeCategory) : true;
    return matchesSearch && (activeCategory ? matchesCat : true);
  });

  const openForm = (p?: Product) => {
    if (p) {
      setEditing(p);
      setFormData(p);
    } else {
      setEditing(null);
      setFormData({
        name: "",
        sku: `SKU${Date.now().toString().slice(-5)}`,
        barcode: `69${Math.floor(Math.random() * 10000000000)}`,
        categoryId: "",
        salePrice: 0,
        costPrice: 0,
        rentalPrice: 0,
        imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop",
        ageRange: "3-6岁",
        tags: [],
        stock: 0,
        safetyStock: 8,
        status: "active",
      });
    }
    setShowForm(true);
  };

  const submitForm = () => {
    if (!formData.name || !formData.categoryId) return;
    const cat = categories.find((c) => c.id === formData.categoryId);
    const product: Product = {
      id: editing?.id || `prod${Date.now()}`,
      sku: formData.sku!,
      barcode: formData.barcode!,
      name: formData.name!,
      categoryId: formData.categoryId!,
      categoryName: cat?.name || "",
      salePrice: Number(formData.salePrice),
      costPrice: Number(formData.costPrice),
      rentalPrice: Number(formData.rentalPrice),
      imageUrl: formData.imageUrl!,
      ageRange: formData.ageRange!,
      tags: formData.tags!,
      stock: Number(formData.stock),
      safetyStock: Number(formData.safetyStock),
      status: formData.status as "active" | "inactive",
      createdAt: editing?.createdAt || new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    if (editing) {
      useAppStore.getState().updateProduct(editing.id, product);
    } else {
      addProduct(product);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">商品管理</h1>
          <p className="text-sm text-text-secondary mt-1">共 {products.length} 个商品 · {filtered.length} 个结果</p>
        </div>
        <div className="flex gap-2">
          <button
            className={cn("btn-outline", scanMode && "ring-2 ring-primary-400 bg-primary-50")}
            onClick={() => setScanMode(!scanMode)}
          >
            <Scan className="w-4 h-4 mr-2" />
            {scanMode ? "关闭扫码" : "扫码录入"}
          </button>
          <button className="btn-primary" onClick={() => openForm()}>
            <Plus className="w-4 h-4 mr-2" />
            新增商品
          </button>
        </div>
      </div>

      {scanMode && (
        <div className="card-sm !bg-gradient-to-r from-secondary-50 to-primary-50 border-2 border-dashed border-secondary-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center text-white">
              <Scan className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                autoFocus
                placeholder="将光标聚焦此处，使用扫码枪扫描商品条码..."
                className="input bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value;
                    const found = products.find((p) => p.barcode === v);
                    if (found) openForm(found);
                    else {
                      setFormData({ ...formData, barcode: v });
                      openForm();
                    }
                  }
                }}
              />
            </div>
            <span className="text-xs text-text-secondary">按 Enter 确认</span>
          </div>
        </div>
      )}

      <div className="flex gap-5 flex-1 min-h-0">
        <aside className="w-60 card-sm flex-shrink-0 overflow-auto scrollbar-thin">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary-500" />
            商品分类
          </h3>
          <div
            className={cn(
              "sidebar-item !px-2.5 !py-2 mb-1",
              !activeCategory ? "sidebar-item-active !bg-gray-100 !text-text-primary !shadow-none" : "sidebar-item-inactive"
            )}
            onClick={() => setActiveCategory(null)}
          >
            全部商品
            <span className="ml-auto text-xs opacity-70">{products.length}</span>
          </div>
          {rootCats.map((cat) => {
            const children = subCats(cat.id);
            const count = products.filter((p) => p.categoryId === cat.id || categories.find((c) => c.id === p.categoryId)?.parentId === cat.id).length;
            const expanded = expandedCats.has(cat.id);
            return (
              <div key={cat.id}>
                <div
                  className={cn(
                    "sidebar-item !px-2.5 !py-2 mb-0.5",
                    activeCategory === cat.id ? "sidebar-item-active" : "sidebar-item-inactive"
                  )}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    toggleCat(cat.id);
                  }}
                >
                  {children.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); toggleCat(cat.id); }}>
                      {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-xs opacity-70">{count}</span>
                </div>
                {expanded && children.map((sub) => {
                  const subCount = products.filter((p) => p.categoryId === sub.id).length;
                  return (
                    <div
                      key={sub.id}
                      className={cn(
                        "sidebar-item !px-6 !py-1.5 !text-xs mb-0.5",
                        activeCategory === sub.id ? "sidebar-item-active" : "sidebar-item-inactive"
                      )}
                      onClick={() => setActiveCategory(sub.id)}
                    >
                      <span className="flex-1 truncate">{sub.name}</span>
                      <span className="opacity-70">{subCount}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="card-sm mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  className="input pl-10 py-2"
                  placeholder="搜索商品名称、SKU、条码..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="select !w-36 py-2">
                <option>所有状态</option>
                <option>上架中</option>
                <option>已下架</option>
              </select>
            </div>
          </div>

          <div className="card-sm flex-1 overflow-auto scrollbar-thin">
            <div className="grid grid-cols-4 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="group rounded-xl border-2 border-border hover:border-primary-300 overflow-hidden transition-all bg-white hover:shadow-card-hover">
                  <div className="aspect-square relative bg-gray-50 overflow-hidden">
                    <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className={cn("badge !text-[10px]", tagColorMap[t] || "bg-gray-100 text-gray-700")}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="w-7 h-7 rounded-lg bg-white/90 shadow-md flex items-center justify-center hover:bg-primary-50" onClick={() => openForm(p)}>
                        <Edit2 className="w-3.5 h-3.5 text-primary-600" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-white/90 shadow-md flex items-center justify-center hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-text-primary line-clamp-1 mb-1">{p.name}</div>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary mb-2">
                      <span>{p.categoryName}</span>
                      <span>·</span>
                      <span>{p.ageRange}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary-600">¥{p.salePrice}</span>
                        <div className="text-[10px] text-text-tertiary">租¥{p.rentalPrice}/天</div>
                      </div>
                      <div className={cn("text-xs font-medium px-2 py-0.5 rounded-md", p.stock <= p.safetyStock ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
                        库存 {p.stock}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-pop overflow-hidden animate-fade-in-up flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">{editing ? "编辑商品" : "新增商品"}</h2>
              <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto scrollbar-thin flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">商品名称 *</label>
                  <input className="input" placeholder="请输入商品名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">SKU 编码</label>
                  <input className="input" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                </div>
                <div>
                  <label className="label">条码</label>
                  <input className="input" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">商品分类 *</label>
                  <select className="select" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                    <option value="">请选择分类</option>
                    {categories.filter((c) => c.parentId).map((c) => (
                      <option key={c.id} value={c.id}>
                        {categories.find((p) => p.id === c.parentId)?.name} / {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">销售价 (¥)</label>
                  <input type="number" className="input" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">成本价 (¥)</label>
                  <input type="number" className="input" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">日租金 (¥)</label>
                  <input type="number" className="input" value={formData.rentalPrice} onChange={(e) => setFormData({ ...formData, rentalPrice: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">适龄段</label>
                  <select className="select" value={formData.ageRange} onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}>
                    {ageRanges.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">当前库存</label>
                  <input type="number" className="input" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">安全库存</label>
                  <input type="number" className="input" value={formData.safetyStock} onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })} />
                </div>
                <div className="col-span-2">
                  <label className="label flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    商品标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span
                        key={t.id}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border-2",
                          formData.tags?.includes(t.name)
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "bg-gray-50 border-transparent text-text-secondary hover:border-border"
                        )}
                        onClick={() => {
                          const newTags = formData.tags?.includes(t.name)
                            ? formData.tags.filter((x) => x !== t.name)
                            : [...(formData.tags || []), t.name];
                          setFormData({ ...formData, tags: newTags });
                        }}
                      >
                        <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: t.color }}></span>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="label flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" />
                    商品图片
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-gray-50 overflow-hidden">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-6 h-6 text-text-tertiary" />
                      )}
                    </div>
                    <input
                      className="input flex-1"
                      placeholder="输入图片URL或点击上传"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-gray-50">
              <button className="btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={submitForm}>保存商品</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
