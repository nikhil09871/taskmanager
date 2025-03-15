import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login data to backend
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
    
      localStorage.setItem('token', response.data.token); // Store token

      console.log("✅ Login Successful:", response.data);
      console.log('Token:', localStorage.getItem('token'));

      // Store user info in localStorage (for session handling)
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Login Error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  const handleAdminRedirect = () => {
    navigate("/admin-login");
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Enter your admin email");
  
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      alert("Reset link sent to your email");
    } catch (err) {
      alert("Error sending reset link");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src="/login-image.jpg" alt="Login" />
      </div>

      <div className="login-form">
        <h2>Zudio Employee Login</h2>
        
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <button onClick={handleSignUpRedirect} className="login-button">
          Sign Up
        </button>

        <button onClick={handleAdminRedirect} className="login-button">
          Admin login
        </button>

        <button onClick={handleForgotPassword} className="login-button">
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default Login;

















/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const user = employees.find((user) => user.email === email && user.password === password);

    if (user) {
      localStorage.setItem("employeeData", JSON.stringify(user));
      navigate("/dashboard");
    } else if (email === "admin@example.com" && password === "admin123") {
      navigate("/admin-dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleAdminRedirect = () => {
    navigate("/admin-login");
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src="/login-image.jpg" alt="Login" />
      </div>
      <div className="login-form">
        <h2>Employee Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <button onClick={handleAdminRedirect} className="login-button">Admin</button>
        <button onClick={handleSignUpRedirect} className="login-button">Sign Up</button>
      </div>
    </div>
  );
};

export default Login;*/