import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Login from './pages/Login.jsx';
import Cart from './pages/Cart.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Register from "./pages/Register.jsx";
// const Home = () => <h1>Home Page</h1>
// const Products = () => <h1>Products</h1>
// const Login = () => <h1>Login screen</h1>
// const Unauthorized = () => <h1>Access denied</h1>
// const Cart = () => <h1>Your shopping cart</h1>
// const AdminPanel = () => <h1>Adming Center</h1>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{ display: 'flex', gap: '15px', padding: '10px', background: '#eee' }}>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/admin">Admin Settings</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/products" element={<Products/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/unauthorized" element={<Unauthorized/>}/>
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']}/>}>
            <Route path="/cart" element={<Cart/>}/>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']}/>}>
            <Route path="/admin" element={<AdminPanel/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
