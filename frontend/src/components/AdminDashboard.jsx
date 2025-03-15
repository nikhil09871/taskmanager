import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const navigate = useNavigate();

  // Ensure admin is authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin-login");
      return;
    }
  
    const fetchData = async () => {
      try {
        // Fetch Users and Pending Tasks
        const usersResponse = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const tasksResponse = await axios.get("http://localhost:5000/api/admin/tasks", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
  
        // Fetch Approved Tasks
        const approvedTasksResponse = await axios.get("http://localhost:5000/api/admin/approved-tasks", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
  
        console.log("Users Response:", usersResponse.data);
        console.log("Tasks Response:", tasksResponse.data);
        console.log("Approved Tasks Response:", approvedTasksResponse.data);
  
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setTasks(Array.isArray(tasksResponse.data) ? tasksResponse.data : []);
        setApprovedTasks(Array.isArray(approvedTasksResponse.data) ? approvedTasksResponse.data : []);
  
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data. Check console for details.");
      }
    };
  
    fetchData();
  }, [navigate]); // Dependency array should only include navigate

  // Handle Admin Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  // Delete Task (Reject Task)
  const handleRejectTask = async (taskId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
  
      // API Call to Delete Task
      const response = await axios.delete(`http://localhost:5000/api/admin/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
  
      console.log("Delete Response:", response);
  
      // Update state to remove the deleted task
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      alert("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error.response || error);
      alert("Failed to delete task.");
    }
  };

  // Update Task Status (Approve/Reject)
  const handleTaskDecision = async (taskId, decision) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.put(
        `http://localhost:5000/api/admin/tasks/${taskId}`,
        { decision },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
  
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
  
      if (decision === "approved") {
        const approvedTask = tasks.find((task) => task._id === taskId);
        setApprovedTasks((prev) => [...prev, { ...approvedTask, status: "approved" }]);
      }
  
      alert(`Task ${decision} successfully`);
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <img src="/images/admin-image.jpg" alt="Admin" className="admin-image" />
        <h2>Admin Panel</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <h1>Admin Dashboard</h1>

        {/* Pending Tasks Section */}
        <div className="task-section">
          <h2 style={{ color: "black" }}>Pending Tasks</h2>
          {tasks.filter((task) => task.status !== "approved").length === 0 ? (
            <p>No pending tasks.</p>
          ) : (
            tasks
              .filter((task) => task.status !== "approved")
              .map((task) => (
                <div key={task._id} className="task-card">
                  <h3>{task.name}</h3>
                  <p>
                    <strong>Duration:</strong> {task.duration}{task.unit}
                  </p>
                  <p>{task.description}</p>
                  <button
                    onClick={() => handleTaskDecision(task._id, "approved")}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectTask(task._id)}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              ))
          )}
        </div>

        {/* Approved Tasks Section */}
        <div className="task-section">
  <h2 style={{ color: "black" }}>Approved Tasks</h2>
  {approvedTasks.length === 0 ? (
    <p>No approved tasks.</p>
  ) : (
    approvedTasks.map((task) => (
      <div key={task._id} className="task-card approved">
        <h3>{task.name}</h3>
        <p>
          <strong>Duration:</strong> {task.duration} {task.unit}
        </p>
        <p>{task.description}</p>
      </div>
    ))
  )}
</div>

        {/* Employee Management Section */}
        <div className="employee-section">
          <h2>Employee List</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="employee-card">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="delete-btn"
                >
                  Delete User
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;