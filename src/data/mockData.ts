import type {
  Product,
  Category,
  Member,
  RentalOrder,
  SaleOrder,
  StockRecord,
  MaintenanceOrder,
  Store,
  Employee,
  Supplier,
  Tag,
  TransferOrder,
  StocktakeOrder,
} from "@/types";

const genId = () => Math.random().toString(36).slice(2, 10);
const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
const dateStr = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const productImages = [
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558877385-8c1f948c6c0c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560859251-d563a49c5e4a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=400&h=400&fit=crop",
];

export const categories: Category[] = [
  { id: "cat1", name: "积木拼装", parentId: null },
  { id: "cat1-1", name: "乐高积木", parentId: "cat1" },
  { id: "cat1-2", name: "国产积木", parentId: "cat1" },
  { id: "cat2", name: "益智玩具", parentId: null },
  { id: "cat2-1", name: "拼图迷宫", parentId: "cat2" },
  { id: "cat2-2", name: "STEM教育", parentId: "cat2" },
  { id: "cat3", name: "毛绒娃娃", parentId: null },
  { id: "cat3-1", name: "卡通公仔", parentId: "cat3" },
  { id: "cat3-2", name: "抱枕靠垫", parentId: "cat3" },
  { id: "cat4", name: "遥控玩具", parentId: null },
  { id: "cat4-1", name: "遥控车", parentId: "cat4" },
  { id: "cat4-2", name: "无人机", parentId: "cat4" },
  { id: "cat5", name: "户外玩具", parentId: null },
  { id: "cat5-1", name: "球类运动", parentId: "cat5" },
  { id: "cat5-2", name: "沙滩玩具", parentId: "cat5" },
];

const catIdToName: Record<string, string> = {};
categories.forEach((c) => (catIdToName[c.id] = c.name));

const productNames = [
  ["乐高城市系列警察局", "cat1-1", 599, 380, 49, "6-12岁"],
  ["乐高哈利波特霍格沃茨", "cat1-1", 899, 580, 79, "8-14岁"],
  ["启蒙积木军事坦克", "cat1-2", 299, 150, 29, "6-12岁"],
  ["小米积木机器人", "cat1-2", 499, 300, 45, "8-14岁"],
  ["木质1000片拼图", "cat2-1", 128, 60, 15, "6岁以上"],
  ["3D立体拼图城堡", "cat2-1", 89, 45, 12, "5-10岁"],
  ["科学实验套装", "cat2-2", 199, 100, 25, "8-14岁"],
  ["编程机器人入门版", "cat2-2", 399, 220, 39, "7-14岁"],
  ["小熊维尼毛绒公仔", "cat3-1", 89, 35, 12, "0岁以上"],
  ["Hello Kitty 大抱枕", "cat3-2", 129, 55, 18, "3岁以上"],
  ["皮卡丘毛绒玩具", "cat3-1", 79, 30, 10, "3岁以上"],
  ["哆啦A梦大公仔", "cat3-1", 159, 70, 22, "3岁以上"],
  ["遥控越野车四驱", "cat4-1", 359, 180, 35, "6岁以上"],
  ["遥控F1赛车高速版", "cat4-1", 499, 260, 49, "8岁以上"],
  ["迷你无人机航拍", "cat4-2", 699, 400, 69, "10岁以上"],
  ["儿童遥控直升飞机", "cat4-2", 259, 120, 28, "8岁以上"],
  ["儿童篮球架套装", "cat5-1", 199, 90, 22, "4-12岁"],
  ["足球训练套装", "cat5-1", 129, 55, 15, "5岁以上"],
  ["沙滩玩具10件套", "cat5-2", 79, 30, 10, "2岁以上"],
  ["儿童羽毛球拍", "cat5-1", 99, 45, 12, "5岁以上"],
  ["乐高幻影忍者", "cat1-1", 459, 290, 42, "7-14岁"],
  ["立体拼图地球仪", "cat2-1", 168, 80, 20, "8岁以上"],
  ["DIY手工制作套装", "cat2-2", 149, 65, 18, "5-10岁"],
  ["独角兽毛绒抱枕", "cat3-2", 99, 40, 14, "3岁以上"],
  ["遥控变形汽车", "cat4-1", 289, 140, 30, "6岁以上"],
  ["儿童滑板车", "cat5-1", 399, 200, 40, "3-8岁"],
  ["积木桶大颗粒", "cat1-2", 199, 90, 20, "2-6岁"],
  ["魔术道具套装", "cat2-2", 119, 50, 15, "7岁以上"],
  ["恐龙毛绒玩具", "cat3-1", 139, 58, 16, "3岁以上"],
  ["遥控船模", "cat4-2", 329, 160, 35, "8岁以上"],
  ["乐高经典创意盒", "cat1-1", 299, 170, 30, "4岁以上"],
  ["数独游戏棋盘", "cat2-1", 89, 40, 12, "6岁以上"],
  ["电子积木电路套装", "cat2-2", 259, 120, 28, "8岁以上"],
  ["草莓熊毛绒公仔", "cat3-1", 109, 45, 15, "3岁以上"],
  ["遥控坦克可发射", "cat4-1", 399, 200, 42, "8岁以上"],
  ["儿童跳绳计数", "cat5-1", 49, 20, 8, "5岁以上"],
];

export const products: Product[] = productNames.map(([name, catId, sale, cost, rental, age], i) => ({
  id: `prod${i + 1}`,
  sku: `SKU${pad(i + 1, 5)}`,
  barcode: `69${pad(10000000 + i * 137, 10)}`,
  name: name as string,
  categoryId: catId as string,
  categoryName: catIdToName[catId as string],
  salePrice: sale as number,
  costPrice: cost as number,
  rentalPrice: rental as number,
  imageUrl: productImages[i % productImages.length],
  ageRange: age as string,
  tags: [i % 3 === 0 ? "热销" : i % 3 === 1 ? "新品" : "推荐"],
  stock: Math.floor(Math.random() * 80) + (i % 7 === 0 ? 2 : 10),
  safetyStock: 8,
  status: "active",
  createdAt: dateStr(Math.floor(Math.random() * 90)),
}));

export const members: Member[] = [
  { id: "m1", memberNo: "M00001", name: "王小萌", phone: "13800138001", level: "gold", depositBalance: 500, totalRentals: 28, status: "active", joinDate: "2024-01-15" },
  { id: "m2", memberNo: "M00002", name: "李梓涵", phone: "13800138002", level: "platinum", depositBalance: 1200, totalRentals: 67, status: "active", joinDate: "2023-08-20" },
  { id: "m3", memberNo: "M00003", name: "张皓轩", phone: "13800138003", level: "silver", depositBalance: 300, totalRentals: 12, status: "active", joinDate: "2024-05-10" },
  { id: "m4", memberNo: "M00004", name: "刘奕辰", phone: "13800138004", level: "normal", depositBalance: 100, totalRentals: 3, status: "active", joinDate: "2025-02-01" },
  { id: "m5", memberNo: "M00005", name: "陈思语", phone: "13800138005", level: "gold", depositBalance: 600, totalRentals: 34, status: "active", joinDate: "2024-03-22" },
  { id: "m6", memberNo: "M00006", name: "杨昊然", phone: "13800138006", level: "silver", depositBalance: 200, totalRentals: 15, status: "active", joinDate: "2024-11-08" },
  { id: "m7", memberNo: "M00007", name: "赵雨萱", phone: "13800138007", level: "platinum", depositBalance: 1500, totalRentals: 89, status: "active", joinDate: "2023-05-18" },
  { id: "m8", memberNo: "M00008", name: "黄梓萱", phone: "13800138008", level: "normal", depositBalance: 0, totalRentals: 1, status: "active", joinDate: "2025-04-12" },
  { id: "m9", memberNo: "M00009", name: "周子涵", phone: "13800138009", level: "gold", depositBalance: 450, totalRentals: 31, status: "frozen", joinDate: "2024-02-28" },
  { id: "m10", memberNo: "M00010", name: "吴欣怡", phone: "13800138010", level: "silver", depositBalance: 250, totalRentals: 18, status: "active", joinDate: "2024-09-14" },
  { id: "m11", memberNo: "M00011", name: "郑嘉怡", phone: "13800138011", level: "normal", depositBalance: 100, totalRentals: 5, status: "active", joinDate: "2025-01-20" },
  { id: "m12", memberNo: "M00012", name: "孙宇轩", phone: "13800138012", level: "platinum", depositBalance: 1000, totalRentals: 72, status: "active", joinDate: "2023-11-30" },
  { id: "m13", memberNo: "M00013", name: "徐诗琪", phone: "13800138013", level: "gold", depositBalance: 400, totalRentals: 26, status: "active", joinDate: "2024-06-05" },
  { id: "m14", memberNo: "M00014", name: "何嘉豪", phone: "13800138014", level: "silver", depositBalance: 150, totalRentals: 9, status: "active", joinDate: "2025-03-17" },
  { id: "m15", memberNo: "M00015", name: "林诗涵", phone: "13800138015", level: "gold", depositBalance: 550, totalRentals: 38, status: "active", joinDate: "2024-04-25" },
];

const rentalItems = [
  [{ productId: "prod1", productName: "乐高城市系列警察局", quantity: 1 }],
  [{ productId: "prod3", productName: "启蒙积木军事坦克", quantity: 1 }],
  [{ productId: "prod13", productName: "遥控越野车四驱", quantity: 1 }, { productId: "prod24", productName: "独角兽毛绒抱枕", quantity: 1 }],
  [{ productId: "prod15", productName: "迷你无人机航拍", quantity: 1 }],
  [{ productId: "prod2", productName: "乐高哈利波特霍格沃茨", quantity: 1 }],
  [{ productId: "prod7", productName: "科学实验套装", quantity: 1 }],
  [{ productId: "prod17", productName: "儿童篮球架套装", quantity: 1 }],
  [{ productId: "prod20", productName: "儿童羽毛球拍", quantity: 2 }],
  [{ productId: "prod8", productName: "编程机器人入门版", quantity: 1 }],
  [{ productId: "prod25", productName: "遥控变形汽车", quantity: 1 }],
];

export const rentalOrders: RentalOrder[] = [
  { id: "r1", orderNo: "R20250601001", memberId: "m2", memberName: "李梓涵", items: rentalItems[0], rentalDays: 7, startDate: dateStr(10), dueDate: dateStr(3), rentalFee: 343, deposit: 600, penalty: 30, status: "overdue", operator: "店员小陈", createdAt: dateStr(10) },
  { id: "r2", orderNo: "R20250602002", memberId: "m1", memberName: "王小萌", items: rentalItems[1], rentalDays: 5, startDate: dateStr(8), dueDate: dateStr(3), rentalFee: 145, deposit: 300, penalty: 25, status: "overdue", operator: "店员小王", createdAt: dateStr(8) },
  { id: "r3", orderNo: "R20250603003", memberId: "m5", memberName: "陈思语", items: rentalItems[2], rentalDays: 3, startDate: dateStr(4), dueDate: dateStr(-1), rentalFee: 150, deposit: 500, penalty: 0, status: "active", operator: "店员小陈", createdAt: dateStr(4) },
  { id: "r4", orderNo: "R20250604004", memberId: "m7", memberName: "赵雨萱", items: rentalItems[3], rentalDays: 5, startDate: dateStr(2), dueDate: dateStr(-3), rentalFee: 345, deposit: 800, penalty: 0, status: "active", operator: "店员小张", createdAt: dateStr(2) },
  { id: "r5", orderNo: "R20250605005", memberId: "m12", memberName: "孙宇轩", items: rentalItems[4], rentalDays: 7, startDate: dateStr(1), dueDate: dateStr(-6), rentalFee: 553, deposit: 900, penalty: 0, status: "active", operator: "店员小陈", createdAt: dateStr(1) },
  { id: "r6", orderNo: "R20250606006", memberId: "m6", memberName: "杨昊然", items: rentalItems[5], rentalDays: 2, startDate: dateStr(0).slice(0, 10) + " 09:00", dueDate: dateStr(-2).slice(0, 10) + " 18:00", rentalFee: 50, deposit: 200, penalty: 0, status: "active", operator: "店员小王", createdAt: dateStr(0) },
  { id: "r7", orderNo: "R20250520007", memberId: "m3", memberName: "张皓轩", items: rentalItems[6], rentalDays: 4, startDate: dateStr(20), dueDate: dateStr(16), returnDate: dateStr(16), rentalFee: 88, deposit: 200, penalty: 0, status: "completed", operator: "店员小张", createdAt: dateStr(20) },
  { id: "r8", orderNo: "R20250518008", memberId: "m10", memberName: "吴欣怡", items: rentalItems[7], rentalDays: 3, startDate: dateStr(22), dueDate: dateStr(19), returnDate: dateStr(19), rentalFee: 36, deposit: 100, penalty: 0, status: "completed", operator: "店员小陈", createdAt: dateStr(22) },
  { id: "r9", orderNo: "R20250510009", memberId: "m13", memberName: "徐诗琪", items: rentalItems[8], rentalDays: 5, startDate: dateStr(30), dueDate: dateStr(25), returnDate: dateStr(24), rentalFee: 195, deposit: 400, penalty: 15, status: "completed", operator: "店员小王", createdAt: dateStr(30) },
  { id: "r10", orderNo: "R20250505010", memberId: "m15", memberName: "林诗涵", items: rentalItems[9], rentalDays: 2, startDate: dateStr(35), dueDate: dateStr(33), returnDate: dateStr(33), rentalFee: 60, deposit: 280, penalty: 0, status: "completed", operator: "店员小张", createdAt: dateStr(35) },
];

export const saleOrders: SaleOrder[] = Array.from({ length: 30 }, (_, i) => {
  const daysAgo = Math.floor(Math.random() * 30);
  const numItems = Math.floor(Math.random() * 3) + 1;
  const items: SaleOrder["items"] = [];
  const usedIdx = new Set<number>();
  let subtotal = 0;
  for (let k = 0; k < numItems; k++) {
    let idx: number;
    do { idx = Math.floor(Math.random() * products.length); } while (usedIdx.has(idx));
    usedIdx.add(idx);
    const p = products[idx];
    const qty = Math.floor(Math.random() * 2) + 1;
    const discount = Math.random() > 0.7 ? 0.9 : 1;
    items.push({
      productId: p.id,
      productName: p.name,
      quantity: qty,
      price: p.salePrice,
      discount,
    });
    subtotal += p.salePrice * qty * discount;
  }
  const discountAmount = Math.random() > 0.6 ? Math.floor(Math.random() * 30) : 0;
  return {
    id: `s${i + 1}`,
    orderNo: `S2025${pad(6 - Math.floor(daysAgo / 7))}${pad(i + 1, 4)}`,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    totalAmount: Math.round((subtotal - discountAmount) * 100) / 100,
    payMethod: (["cash", "wechat", "alipay", "member"] as const)[Math.floor(Math.random() * 4)],
    memberId: Math.random() > 0.4 ? members[Math.floor(Math.random() * members.length)].id : undefined,
    status: i % 23 === 0 ? "returned" : "paid",
    operator: ["店员小陈", "店员小王", "店员小张"][Math.floor(Math.random() * 3)],
    createdAt: dateStr(daysAgo),
  };
});

export const stockRecords: StockRecord[] = [
  { id: "stk1", type: "inbound", productId: "prod1", productName: "乐高城市系列警察局", quantity: 20, beforeStock: 5, afterStock: 25, relatedOrderNo: "IN20250601", operator: "店长-李明", remark: "周度补货", createdAt: dateStr(5) },
  { id: "stk2", type: "inbound", productId: "prod13", productName: "遥控越野车四驱", quantity: 15, beforeStock: 8, afterStock: 23, relatedOrderNo: "IN20250602", operator: "店长-李明", remark: "补货", createdAt: dateStr(4) },
  { id: "stk3", type: "damage", productId: "prod2", productName: "乐高哈利波特霍格沃茨", quantity: 1, beforeStock: 12, afterStock: 11, relatedOrderNo: "DM20250601", operator: "店员小陈", remark: "包装盒破损", createdAt: dateStr(3) },
  { id: "stk4", type: "transfer", productId: "prod7", productName: "科学实验套装", quantity: 10, beforeStock: 25, afterStock: 15, relatedOrderNo: "TR20250601", operator: "店长-李明", remark: "调拨至朝阳门店", createdAt: dateStr(2) },
  { id: "stk5", type: "inbound", productId: "prod20", productName: "儿童羽毛球拍", quantity: 30, beforeStock: 3, afterStock: 33, relatedOrderNo: "IN20250603", operator: "店长-李明", remark: "旺季备货", createdAt: dateStr(1) },
  { id: "stk6", type: "stocktake", productId: "prod9", productName: "小熊维尼毛绒公仔", quantity: 1, beforeStock: 15, afterStock: 14, relatedOrderNo: "SK20250601", operator: "店员小王", remark: "盘点差异-盘亏", createdAt: dateStr(0) },
  { id: "stk7", type: "damage", productId: "prod25", productName: "遥控变形汽车", quantity: 2, beforeStock: 18, afterStock: 16, relatedOrderNo: "DM20250602", operator: "店员小张", remark: "功能故障，返厂维修", createdAt: dateStr(6) },
  { id: "stk8", type: "transfer", productId: "prod5", productName: "木质1000片拼图", quantity: 8, beforeStock: 0, afterStock: 8, relatedOrderNo: "TR20250602", operator: "店长-李明", remark: "从海淀门店调入", createdAt: dateStr(7) },
];

export const maintenanceOrders: MaintenanceOrder[] = [
  { id: "mt1", orderNo: "MT20250601001", type: "repair", productId: "prod13", productName: "遥控越野车四驱", description: "遥控距离变短，车轮卡滞", assignee: "店员小张", status: "pending", expectedDate: dateStr(-1).slice(0, 10), customerName: "王先生", customerPhone: "13900139001", operator: "店员小陈", createdAt: dateStr(0) },
  { id: "mt2", orderNo: "MT20250601002", type: "clean", productName: "出租玩具套装-A", description: "深度清洁消毒（租借归还后）", assignee: "店员小王", status: "processing", expectedDate: dateStr(-1).slice(0, 10), operator: "店员小陈", createdAt: dateStr(1) },
  { id: "mt3", orderNo: "MT20250531003", type: "repair", productId: "prod15", productName: "迷你无人机航拍", description: "桨叶损坏，需更换桨叶保护罩", assignee: "店员小张", status: "processing", expectedDate: dateStr(-2).slice(0, 10), customerName: "李女士", customerPhone: "13900139002", operator: "店员小王", createdAt: dateStr(2) },
  { id: "mt4", orderNo: "MT20250530004", type: "clean", productName: "乐高积木颗粒套装", description: "超声波清洁+分类整理", assignee: "店员小陈", status: "review", expectedDate: dateStr(0).slice(0, 10), operator: "店员小张", createdAt: dateStr(3) },
  { id: "mt5", orderNo: "MT20250528005", type: "repair", productId: "prod25", productName: "遥控变形汽车", description: "变形机构失灵，需维修齿轮组", assignee: "店员小张", status: "review", expectedDate: dateStr(-1).slice(0, 10), customerName: "赵先生", customerPhone: "13900139003", operator: "店员小王", createdAt: dateStr(5) },
  { id: "mt6", orderNo: "MT20250525006", type: "clean", productName: "毛绒玩具消毒批次-1", description: "紫外线消毒+表面清洁", assignee: "店员小王", status: "completed", expectedDate: dateStr(4).slice(0, 10), operator: "店员小陈", createdAt: dateStr(8), completedAt: dateStr(5) },
  { id: "mt7", orderNo: "MT20250520007", type: "repair", productId: "prod8", productName: "编程机器人入门版", description: "主板故障，已返厂更换", assignee: "店长-李明", status: "completed", expectedDate: dateStr(10).slice(0, 10), customerName: "陈女士", customerPhone: "13900139004", operator: "店员小张", createdAt: dateStr(18), completedAt: dateStr(10) },
  { id: "mt8", orderNo: "MT20250601008", type: "repair", description: "新工单：电动玩具不工作，需检查", status: "pending", customerName: "待登记", operator: "店员小陈", createdAt: dateStr(0) },
];

export const storeInfo: Store = {
  id: "store1",
  code: "STORE-001",
  name: "童趣玩具屋（中关村旗舰店）",
  address: "北京市海淀区中关村大街1号",
  phone: "010-88886666",
  email: "zhongguancun@tongqu-toys.com",
  businessHours: "周一至周日 09:00 - 21:00",
  manager: "李明",
  description: "旗舰店，占地280平米，是品牌形象展示与销售一体化的核心门店，提供全品类玩具的体验与购买服务。",
};

export const employees: Employee[] = [
  { id: "e1", username: "admin", name: "李明", role: "manager", phone: "13800000001", email: "liming@tongqu.com", status: "active", createdAt: "2023-06-01" },
  { id: "e2", username: "chen", name: "陈美丽", role: "staff", phone: "13800000002", email: "chenmeili@tongqu.com", status: "active", createdAt: "2023-11-15" },
  { id: "e3", username: "wang", name: "王志强", role: "staff", phone: "13800000003", email: "wangzhiqiang@tongqu.com", status: "active", createdAt: "2024-02-20" },
  { id: "e4", username: "zhang", name: "张小华", role: "staff", phone: "13800000004", email: "zhangxiaohua@tongqu.com", status: "active", createdAt: "2024-05-10" },
  { id: "e5", username: "liu", name: "刘晓婷", role: "cleaner", phone: "13800000005", email: "liuxiaoting@tongqu.com", status: "active", createdAt: "2024-03-01" },
];

export const suppliers: Supplier[] = [
  { id: "sup1", name: "乐高（中国）有限公司", contact: "张经理", phone: "021-60000001", address: "上海市黄浦区南京东路1266号恒基名人商业大厦", status: "active", products: ["乐高城市系列警察局", "乐高哈利波特霍格沃茨", "乐高幻影忍者", "乐高经典创意盒"], createdAt: "2023-01-15" },
  { id: "sup2", name: "启蒙玩具厂", contact: "李总", phone: "0754-80000001", address: "广东省汕头市澄海区广益街道登峰路中段", status: "active", products: ["启蒙积木军事坦克", "小米积木机器人", "积木桶大颗粒"], createdAt: "2023-03-20" },
  { id: "sup3", name: "星辉互动娱乐", contact: "王经理", phone: "0754-80000002", address: "广东省汕头市澄海区广益街道星辉工业园", status: "active", products: ["遥控越野车四驱", "遥控F1赛车高速版", "遥控变形汽车", "遥控坦克可发射"], createdAt: "2023-04-10" },
  { id: "sup4", name: "大疆创新儿童系列", contact: "赵经理", phone: "0755-80000001", address: "广东省深圳市南山区粤海街道高新南一道16号", status: "active", products: ["迷你无人机航拍", "儿童遥控直升飞机", "遥控船模"], createdAt: "2023-06-05" },
  { id: "sup5", name: "迪士尼授权经销商", contact: "林经理", phone: "021-60000002", address: "上海市浦东新区张江高科技园区博云路2号", status: "inactive", products: ["小熊维尼毛绒公仔", "Hello Kitty 大抱枕", "皮卡丘毛绒玩具", "哆啦A梦大公仔", "草莓熊毛绒公仔"], createdAt: "2023-02-28" },
];

export const tags: Tag[] = [
  { id: "t1", name: "热销", type: "product", color: "#FF4D4F", description: "月销量排名前20的商品" },
  { id: "t2", name: "新品", type: "product", color: "#1A73E8", description: "最近30天新上架的商品" },
  { id: "t3", name: "推荐", type: "product", color: "#52C41A", description: "店长推荐商品" },
  { id: "t4", name: "限量", type: "product", color: "#FAAD14", description: "限量发售或绝版商品" },
  { id: "t5", name: "断货", type: "product", color: "#8F959E", description: "暂时缺货" },
  { id: "t6", name: "爆款", type: "product", color: "#FF6B35", description: "销量王单品" },
  { id: "t7", name: "VIP专属", type: "member", color: "#722ED1", description: "白金及以上会员" },
  { id: "t8", name: "高价值", type: "member", color: "#13C2C2", description: "累计消费超5000元" },
  { id: "t9", name: "活跃用户", type: "member", color: "#52C41A", description: "最近30天有消费" },
  { id: "t10", name: "沉睡用户", type: "member", color: "#8F959E", description: "超过90天无消费" },
  { id: "t11", name: "待回访", type: "member", color: "#FAAD14", description: "需要跟进回访的会员" },
];

export const transferOrders: TransferOrder[] = [
  { id: "tr1", orderNo: "TR20250601001", fromStore: "海淀店", toStore: "朝阳店", items: [{ productId: "prod7", productName: "科学实验套装", quantity: 10 }], status: "shipped", operator: "店长-李明", createdAt: dateStr(2) },
  { id: "tr2", orderNo: "TR20250528002", fromStore: "朝阳店", toStore: "中关村店", items: [{ productId: "prod5", productName: "木质1000片拼图", quantity: 8 }], status: "received", operator: "店长-李明", createdAt: dateStr(7) },
  { id: "tr3", orderNo: "TR20250602003", fromStore: "中关村店", toStore: "西城店", items: [{ productId: "prod20", productName: "儿童羽毛球拍", quantity: 15 }, { productId: "prod26", productName: "儿童滑板车", quantity: 5 }], status: "pending", operator: "店长-李明", createdAt: dateStr(0) },
];

export const stocktakeOrders: StocktakeOrder[] = [
  { id: "sk1", orderNo: "SK20250601", name: "6月上旬积木区盘点", items: [
    { productId: "prod1", productName: "乐高城市系列警察局", systemStock: 25, actualStock: 24, diff: -1 },
    { productId: "prod2", productName: "乐高哈利波特霍格沃茨", systemStock: 11, actualStock: 11, diff: 0 },
    { productId: "prod3", productName: "启蒙积木军事坦克", systemStock: 18, actualStock: 17, diff: -1 },
  ], status: "confirmed", operator: "店员小王", createdAt: dateStr(1) },
  { id: "sk2", orderNo: "SK20250602", name: "遥控玩具区盘点", items: [
    { productId: "prod13", productName: "遥控越野车四驱", systemStock: 23, actualStock: 23, diff: 0 },
    { productId: "prod15", productName: "迷你无人机航拍", systemStock: 9, actualStock: 9, diff: 0 },
  ], status: "draft", operator: "店员小张", createdAt: dateStr(0) },
];
