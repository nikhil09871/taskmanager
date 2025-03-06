import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure all fields are filled
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("🔍 Sending Data:", formData); // Log form data before sending
    
      const response = await axios.post("http://localhost:5000/api/auth/signup", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Only if you need cookies/session
      });
      
    
      console.log("✅ Response Data:", response.data); // Log the response from the backend
    
      alert(response.data.message || "Sign-up successful! You can now log in.");
    
      navigate("/");
    } catch (error) {
      console.error("❌ Signup Error:", error); // Log the full error object
    
      setError(error.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role (Occupation):</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Frontend Developer"
            required
          />
        </div>

        <button type="submit" className="signup-button">Sign Up</button>

        <p className="redirect-login" onClick={() => navigate("/")}>Already have an account? Log in</p>
      </form>
    </div>
  );
};

export default SignUp;
















/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: All fields must be filled
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("All fields are required.");
      return;
    }

    // Get users from localStorage
    const employees = JSON.parse(localStorage.getItem("employees")) || [];

    // Check if user already exists
    const userExists = employees.some((user) => user.email === formData.email);
    if (userExists) {
      setError("User already exists with this email.");
      return;
    }

    // Save new user to localStorage
    employees.push(formData);
    localStorage.setItem("employees", JSON.stringify(employees));

    alert("Sign-up successful! You can now log in.");

    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role (Occupation):</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Frontend Developer"
            required
          />
        </div>

        <button type="submit" className="signup-button">Sign Up</button>

        <p className="redirect-login" onClick={() => navigate("/")}>Already have an account? Log in</p>
      </form>
    </div>
  );
};

export default SignUp;*/