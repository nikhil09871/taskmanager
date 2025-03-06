// src/components/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Reuse the same CSS for styling

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Default Admin Credentials (For Testing)
  const ADMIN_EMAIL = "nk9557907@gmail.com";
  const ADMIN_PASSWORD = "123";

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if entered credentials match the admin's
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminToken", "admin-token");
      navigate("/admin-dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  const handleEmployeeLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src="/admin-image.jpg" alt="Admin Login" />
      </div>
      <div className="login-form">
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter admin email"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <button onClick={handleEmployeeLoginRedirect} className="login-button">Employee Login</button>
      </div>
    </div>
  );
};

export default AdminLogin;
