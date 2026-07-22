import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar.jsx"; 

import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from "./pages/ProductDetail.jsx";
import Login from './pages/Login.jsx';
import Cart from './pages/Cart.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Register from "./pages/Register.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          
          <Navbar />

          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/products" element={<Products/>}/>
            <Route path="/products/:id" element={<ProductDetails/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/unauthorized" element={<Unauthorized/>}/>
            <Route path="/profile" element={<ProfileDashboard/>}/>
            
            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']}/>}>
              <Route path="/cart" element={<Cart/>}/>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']}/>}>
              <Route path="/admin" element={<AdminPanel/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}