// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import AdminLogin from "./components/admin-login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import Signup from "./components/SignUp.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import AdminResetPassword from "./components/AdminResetPassword";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
    </Routes>
  );
};

export default App;




//mongodb+srv://user1:Nikhil@cluster1.1c4ye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1