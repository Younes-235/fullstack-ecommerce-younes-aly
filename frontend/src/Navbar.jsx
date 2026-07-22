import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styles from "./Navbar.module.css"; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brandZone}>
        <Link to="/" className={styles.logo}>🛍️ E-Store</Link>
      </div>

      <div className={styles.linksZone}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/products" className={styles.navLink}>Products</Link>
        
        {user && (
          <>
            <Link to="/cart" className={styles.navLink}>Cart</Link>
            <Link to="/profile" className={styles.navLink}>Profile</Link>
          </>
        )}

        {user?.role === "admin" && (
          <Link to="/admin" className={styles.adminLink}>Admin Settings</Link>
        )}
      </div>

      <div className={styles.authZone}>
        {user ? (
          <div className={styles.userStatus}>
            <span className={styles.welcomeText}>
              Logged in as: <strong>{user.email}</strong>
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.guestButtons}>
            <Link to="/login" className={styles.loginLink}>Login</Link>
            <Link to="/register" className={styles.registerButton}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}