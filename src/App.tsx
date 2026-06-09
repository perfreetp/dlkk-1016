import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Inventory from "@/pages/Inventory";
import Rental from "@/pages/Rental";
import Sales from "@/pages/Sales";
import Maintenance from "@/pages/Maintenance";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/rental" element={<Rental />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}
