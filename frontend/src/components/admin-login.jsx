// AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css"; // Ensure the path is correct

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Admin Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      // Store the admin token and redirect
      localStorage.setItem("adminToken", response.data.token);
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) return alert("❗ Please enter your admin email");

    try {
      await axios.post("http://localhost:5000/api/admin/forgot-password", { email });
      alert("📧 Reset link sent to your admin email. Check your inbox.");
    } catch (err) {
      alert("❌ Error sending reset link. Try again.");
    }
  };

  // Redirect to Employee Login
  const handleEmployeeLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src="/admin-image.jpg" alt="Admin Login" />
      </div>
      <div className="login-form">
        <h2>🔐 Admin Login</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Submit Button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot Password Button */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="login-button"
          >
            Forgot Password?
          </button>
        </form>

        {/* Switch to Employee Login */}
        <button
          onClick={handleEmployeeLoginRedirect}
          className="login-button secondary"
        >
          Employee Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
