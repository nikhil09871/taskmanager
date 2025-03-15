// ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ResetPassword.css"; // Ensure correct import path

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate(); // ✅ Initialize useNavigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        password,
        token,
      });

      setMessage(`✅ ${response.data.message}`);

      // ✅ Redirect to Login after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || "Error resetting password"}`);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">🔒 Reset Password</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="button">Reset Password</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
