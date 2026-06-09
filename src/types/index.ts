export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  categoryName: string;
  salePrice: number;
  costPrice: number;
  rentalPrice: number;
  imageUrl: string;
  ageRange: string;
  tags: string[];
  stock: number;
  safetyStock: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Member {
  id: string;
  memberNo: string;
  name: string;
  phone: string;
  level: "normal" | "silver" | "gold" | "platinum";
  depositBalance: number;
  totalRentals: number;
  status: "active" | "frozen";
  joinDate: string;
}

export interface RentalOrder {
  id: string;
  orderNo: string;
  memberId: string;
  memberName: string;
  items: { productId: string; productName: string; quantity: number }[];
  rentalDays: number;
  startDate: string;
  dueDate: string;
  returnDate?: string;
  rentalFee: number;
  deposit: number;
  penalty: number;
  status: "pending" | "active" | "overdue" | "returned" | "completed";
  operator: string;
  createdAt: string;
}

export interface SaleOrder {
  id: string;
  orderNo: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  payMethod: "cash" | "wechat" | "alipay" | "member";
  memberId?: string;
  status: "paid" | "returned" | "exchanged";
  returnReason?: string;
  exchangeReason?: string;
  refundAmount?: number;
  processNote?: string;
  processedAt?: string;
  operator: string;
  createdAt: string;
}

export interface StockRecord {
  id: string;
  type: "inbound" | "transfer" | "stocktake" | "damage" | "rental_out" | "rental_in" | "sale" | "sale_return";
  productId: string;
  productName: string;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  relatedOrderNo: string;
  operator: string;
  remark: string;
  createdAt: string;
}

export interface MaintenanceOrder {
  id: string;
  orderNo: string;
  type: "clean" | "repair";
  productId?: string;
  productName?: string;
  description: string;
  assignee?: string;
  status: "pending" | "processing" | "review" | "completed";
  expectedDate?: string;
  customerName?: string;
  customerPhone?: string;
  operator: string;
  createdAt: string;
  completedAt?: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  manager: string;
  description?: string;
}

export interface Employee {
  id: string;
  username: string;
  name: string;
  role: "manager" | "staff" | "cleaner";
  phone: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  products: string[];
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  type: "product" | "member";
  color: string;
  description?: string;
}

export interface TransferOrder {
  id: string;
  orderNo: string;
  fromStore: string;
  toStore: string;
  items: { productId: string; productName: string; quantity: number; shippedQuantity?: number }[];
  status: "pending" | "shipped" | "received";
  operator: string;
  createdAt: string;
}

export interface StocktakeOrder {
  id: string;
  orderNo: string;
  name: string;
  items: {
    productId: string;
    productName: string;
    systemStock: number;
    actualStock: number;
    diff: number;
  }[];
  status: "draft" | "confirmed";
  operator: string;
  createdAt: string;
}
