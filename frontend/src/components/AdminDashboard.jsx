import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
const [selectedProject, setSelectedProject] = useState("");
const [selectedUsers, setSelectedUsers] = useState([{ email: "", role: "" }]);

  const navigate = useNavigate();


  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

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

  const handleAddUser = () => {
    setSelectedUsers([...selectedUsers, { email: "", role: "" }]);
  };
  
  const handleUserChange = (index, field, value) => {
    const updatedUsers = [...selectedUsers];
    updatedUsers[index][field] = value;
    setSelectedUsers(updatedUsers);
  };
  
  const handleCreateGroup = async () => {
    const token = localStorage.getItem("adminToken"); // Correct key

  
    if (!token) {
      console.error("No token found. Please login.");
      alert("No token found. Please login.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/create-group",
        {
          projectTitle: selectedProject, // Ensure this is set properly
          users: selectedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Group created:", response.data);
      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data?.message || error.message));
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

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
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

        <div className="admin-buttons">
          <button onClick={toggleDarkMode} className="theme-toggle-btn">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          </div>
          <div className="admin-buttons">
      <button onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}>
  {showCreateGroupForm ? "Cancel" : "Create Group"}
</button>
</div>
      </div>
   

{showCreateGroupForm && (
  <div className="create-group-form">
    <label>Project Title:</label>
    <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
      <option value="">Select Project</option>
      {approvedTasks.map((task) => (
        <option key={task._id} value={task.name}>{task.name}</option>
      ))}
    </select>

    {selectedUsers.map((user, index) => (
      <div key={index} className="user-row">
        <label>User Email:</label>
        <select value={user.email} onChange={(e) => handleUserChange(index, "email", e.target.value)}>
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u._id} value={u.email}>{u.email}</option>
          ))}
        </select>

        <label>Role:</label>
        <input
          type="text"
          value={user.role}
          onChange={(e) => handleUserChange(index, "role", e.target.value)}
          placeholder="Assign Role"
        />
      </div>
    ))}

    <button onClick={handleAddUser}>Add More Users</button>
    <button onClick={handleCreateGroup}>Submit</button>
  </div>
)}


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