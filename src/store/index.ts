import { create } from "zustand";
import type {
  Product,
  Category,
  Member,
  RentalOrder,
  SaleOrder,
  StockRecord,
  MaintenanceOrder,
  Store as StoreInfo,
  Employee,
  Supplier,
  Tag,
  TransferOrder,
  StocktakeOrder,
} from "@/types";
import {
  products as initialProducts,
  categories as initialCategories,
  members as initialMembers,
  rentalOrders as initialRentals,
  saleOrders as initialSales,
  stockRecords as initialStockRecords,
  maintenanceOrders as initialMaintenance,
  storeInfo as initialStore,
  employees as initialEmployees,
  suppliers as initialSuppliers,
  tags as initialTags,
  transferOrders as initialTransfers,
  stocktakeOrders as initialStocktakes,
} from "@/data/mockData";

interface AppState {
  products: Product[];
  categories: Category[];
  members: Member[];
  rentalOrders: RentalOrder[];
  saleOrders: SaleOrder[];
  stockRecords: StockRecord[];
  maintenanceOrders: MaintenanceOrder[];
  store: StoreInfo;
  employees: Employee[];
  suppliers: Supplier[];
  tags: Tag[];
  transferOrders: TransferOrder[];
  stocktakeOrders: StocktakeOrder[];

  productHistory: { id: string; name: string } | null;
  openProductHistory: (id: string, name: string) => void;
  closeProductHistory: () => void;

  orderFocus: { orderNo: string; page: "inventory" | "sales" | "rental"; tab?: string } | null;
  setOrderFocus: (focus: { orderNo: string; page: "inventory" | "sales" | "rental"; tab?: string } | null) => void;

  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: Category) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addMember: (m: Member) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  addRental: (r: RentalOrder) => void;
  updateRental: (id: string, r: Partial<RentalOrder>) => void;

  addSale: (s: SaleOrder) => void;
  updateSale: (id: string, s: Partial<SaleOrder>) => void;

  addStockRecord: (s: StockRecord) => void;
  addTransfer: (t: TransferOrder) => void;
  updateTransfer: (id: string, t: Partial<TransferOrder>) => void;
  addStocktake: (s: StocktakeOrder) => void;

  addMaintenance: (m: MaintenanceOrder) => void;
  updateMaintenance: (id: string, m: Partial<MaintenanceOrder>) => void;

  updateStore: (s: Partial<StoreInfo>) => void;
  addEmployee: (e: Employee) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addSupplier: (s: Supplier) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addTag: (t: Tag) => void;
  updateTag: (id: string, t: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  products: initialProducts,
  categories: initialCategories,
  members: initialMembers,
  rentalOrders: initialRentals,
  saleOrders: initialSales,
  stockRecords: initialStockRecords,
  maintenanceOrders: initialMaintenance,
  store: initialStore,
  employees: initialEmployees,
  suppliers: initialSuppliers,
  tags: initialTags,
  transferOrders: initialTransfers,
  stocktakeOrders: initialStocktakes,

  productHistory: null,
  openProductHistory: (id, name) => set({ productHistory: { id, name } }),
  closeProductHistory: () => set({ productHistory: null }),

  orderFocus: null,
  setOrderFocus: (focus) => set({ orderFocus: focus }),

  addProduct: (p) => set((s) => ({ products: [p, ...s.products] })),
  updateProduct: (id, p) =>
    set((s) => ({
      products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)),
    })),
  deleteProduct: (id) =>
    set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
  addCategory: (c) => set((s) => ({ categories: [...s.categories, c] })),
  updateCategory: (id, c) =>
    set((s) => ({
      categories: s.categories.map((x) => (x.id === id ? { ...x, ...c } : x)),
    })),
  deleteCategory: (id) =>
    set((s) => ({
      categories: s.categories.filter((x) => x.id !== id && x.parentId !== id),
    })),

  addMember: (m) => set((s) => ({ members: [m, ...s.members] })),
  updateMember: (id, m) =>
    set((s) => ({
      members: s.members.map((x) => (x.id === id ? { ...x, ...m } : x)),
    })),
  addRental: (r) => set((s) => ({ rentalOrders: [r, ...s.rentalOrders] })),
  updateRental: (id, r) =>
    set((s) => ({
      rentalOrders: s.rentalOrders.map((x) => (x.id === id ? { ...x, ...r } : x)),
    })),

  addSale: (s) => set((state) => ({ saleOrders: [s, ...state.saleOrders] })),
  updateSale: (id, s) =>
    set((state) => ({
      saleOrders: state.saleOrders.map((x) => (x.id === id ? { ...x, ...s } : x)),
    })),

  addStockRecord: (r) =>
    set((s) => ({ stockRecords: [r, ...s.stockRecords] })),
  addTransfer: (t) => set((s) => ({ transferOrders: [t, ...s.transferOrders] })),
  updateTransfer: (id, t) =>
    set((s) => ({
      transferOrders: s.transferOrders.map((x) => (x.id === id ? { ...x, ...t } : x)),
    })),
  addStocktake: (sk) =>
    set((s) => ({ stocktakeOrders: [sk, ...s.stocktakeOrders] })),

  addMaintenance: (m) =>
    set((s) => ({ maintenanceOrders: [m, ...s.maintenanceOrders] })),
  updateMaintenance: (id, m) =>
    set((s) => ({
      maintenanceOrders: s.maintenanceOrders.map((x) =>
        x.id === id ? { ...x, ...m } : x
      ),
    })),

  updateStore: (s) => set((state) => ({ store: { ...state.store, ...s } })),
  addEmployee: (e) => set((s) => ({ employees: [e, ...s.employees] })),
  updateEmployee: (id, e) =>
    set((s) => ({
      employees: s.employees.map((x) => (x.id === id ? { ...x, ...e } : x)),
    })),
  deleteEmployee: (id) =>
    set((s) => ({ employees: s.employees.filter((x) => x.id !== id) })),
  addSupplier: (sup) => set((s) => ({ suppliers: [sup, ...s.suppliers] })),
  updateSupplier: (id, sup) =>
    set((s) => ({
      suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, ...sup } : x)),
    })),
  deleteSupplier: (id) =>
    set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) })),
  addTag: (t) => set((s) => ({ tags: [...s.tags, t] })),
  updateTag: (id, t) =>
    set((s) => ({
      tags: s.tags.map((x) => (x.id === id ? { ...x, ...t } : x)),
    })),
  deleteTag: (id) =>
    set((s) => ({ tags: s.tags.filter((x) => x.id !== id) })),
}));
