// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import AdminLogin from "./components/admin-login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import Signup from "./components/SignUp.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default App;




//mongodb+srv://user1:Nikhil@045@cluster1.1c4ye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1