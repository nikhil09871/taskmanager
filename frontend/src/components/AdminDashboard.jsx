import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin-login");
    }

    // Fetch employees and tasks from local storage
    const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setEmployees(storedEmployees);
    setTasks(storedTasks);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const handleDeleteUser = (email) => {
    const updatedEmployees = employees.filter((emp) => emp.email !== email);
    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  const handleTaskDecision = (index, decision) => {
    const updatedTasks = [...tasks];
    if (decision === "accept") {
      updatedTasks[index].status = "approved";
    } else {
      updatedTasks.splice(index, 1);
    }
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        <img src="/images/admin-image.jpg" alt="Admin" className="admin-image" />
        <h2>Admin Panel</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="admin-content">
        <h1>Admin Dashboard</h1>

        {/* Pending Tasks Section */}
        <div className="task-section">
          <h2>Pending Tasks</h2>
          {tasks.filter((task) => task.status !== "approved").length === 0 ? (
            <p>No pending tasks.</p>
          ) : (
            tasks.map((task, index) => (
              task.status !== "approved" && (
                <div key={index} className="task-card">
                  <h3>{task.name}</h3>
                  <p><strong>Duration:</strong> {task.duration}</p>
                  <p>{task.description}</p>
                  <button onClick={() => handleTaskDecision(index, "accept")} className="accept-btn">Accept</button>
                  <button onClick={() => handleTaskDecision(index, "reject")} className="reject-btn">Reject</button>
                </div>
              )
            ))
          )}
        </div>

        {/* Approved Tasks Section */}
        <div className="task-section">
          <h2>Approved Tasks</h2>
          {tasks.filter((task) => task.status === "approved").length === 0 ? (
            <p>No approved tasks.</p>
          ) : (
            tasks.map((task, index) => (
              task.status === "approved" && (
                <div key={index} className="task-card approved">
                  <h3>{task.name}</h3>
                  <p><strong>Duration:</strong> {task.duration}</p>
                  <p>{task.description}</p>
                </div>
              )
            ))
          )}
        </div>

        {/* Employee Management Section */}
        <div className="employee-section">
          <h2>Employee List</h2>
          {employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            employees.map((emp, index) => (
              <div key={index} className="employee-card">
                <h3>{emp.name}</h3>
                <p>{emp.role}</p>
                <button onClick={() => handleDeleteUser(emp.email)} className="delete-btn">Delete User</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;