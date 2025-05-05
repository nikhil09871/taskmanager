import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Dashboard.css';
import PieChart from "../components/PieChart";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [image, setImage] = useState(null);
  const [user, setUser] = useState({ name: '', role: '' });
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState({});
  const [taskData, setTaskData] = useState({
    name: '',
    duration: '',
    unit: 'days',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
const [allUsers, setAllUsers] = useState([]);
const [selectedUsers, setSelectedUsers] = useState([]);


  const [taskCompletion, setTaskCompletion] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null); // Reference for the settings dropdown

  

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('Unauthorized: Please log in again.');
      navigate('/login');
    } else {
      fetchTasks();
      fetchUserProfile();
    }
  }, [token, navigate]);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    if (showVideoCallModal) {
      fetchAllUsers();
    }
  }, [showVideoCallModal]);
  

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User profile response:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      alert('Failed to fetch user profile');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the settings dropdown
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
  
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);
  

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks/add', taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task added successfully');
      setTaskData({
        name: '',
        duration: '',
        unit: 'days',
        description: '',
        startDate: '',
        endDate: ''
      });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleCalendar = (taskId) => {
    setShowCalendar((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // Calculate days left between current date and task's end date
  // Calculate time left between today and the task's end date
const calculateTimeLeft = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);

  // Ensure time is set to midnight to avoid timezone issues
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const timeDifference = end - today;

  // If the task is overdue
  if (timeDifference < 0) return "Time's up";

  // Convert milliseconds to days
  return `${Math.ceil(timeDifference / (1000 * 60 * 60 * 24))} days left`;
};

const toggleTheme = () => {
  const newTheme = isDarkMode ? 'light' : 'dark';
  setIsDarkMode(!isDarkMode);
  localStorage.setItem('theme', newTheme);
};


// Delete Task Function
const handleDeleteTask = async (taskId) => {
  if (!window.confirm('Are you sure you want to delete this task?')) return;

  try {
    await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Task deleted successfully');
    
    // Remove the deleted task from the state
    setTasks(tasks.filter((task) => task._id !== taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task');
  }
};

const handleImageChange = (e) => {
  setImage(e.target.files[0]);
};

const uploadProfilePicture = async () => {
  if (!image) return alert("Please select an image.");

  const formData = new FormData();
  formData.append("profilePicture", image);

  try {
    const response = await axios.post("http://localhost:5000/api/auth/upload-profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    alert("Profile picture updated!");
    fetchUserProfile(); // Refresh user data
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload profile picture");
  }
};

const calculateCompletionPercentage = (startDate, endDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (today < start) return 0; // Task hasn't started yet
  if (today > end) return 100; // Task is fully completed

  const totalDuration = end - start;
  const elapsedTime = today - start;
  return Math.round((elapsedTime / totalDuration) * 100);
};

const handleCompletionChange = (taskId, value) => {
  setTaskCompletion((prev) => ({
    ...prev,
    [taskId]: value
  }));
};

const sendVideoCallInvites = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/videocall/send-invites', {
      emails: selectedUsers
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert(response.data.message || "Invites sent!");
    setShowVideoCallModal(false);
    setSelectedUsers([]);
  } catch (error) {
    console.error("Error sending invites:", error);
    alert("Failed to send invites");
  }
};



  return (

    
    <div className={`dashboard-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="top-right-settings" ref={settingsRef}>
      <div className="task-count">
    <span>Tasks Created: {tasks.length}</span>
  </div>
    <button className="settings-button" onClick={toggleSettings}>Settings ⚙️</button>
    <button className="video-call-button" onClick={() => setShowVideoCallModal(true)}>
  📹 Video Call
    </button>

    {showVideoCallModal && (
  <div className="video-call-modal">
    <h3>Select Users to Invite</h3>
    <ul>
      {allUsers.map((u) => (
        <li key={u._id}>
          <label>
            <input
              type="checkbox"
              value={u.email}
              onChange={(e) => {
                const email = e.target.value;
                setSelectedUsers(prev =>
                  prev.includes(email)
                    ? prev.filter(e => e !== email)
                    : [...prev, email]
                );
              }}
            />
            {u.email}
          </label>
        </li>
      ))}
    </ul>
    <button onClick={sendVideoCallInvites}>Send Invite</button>
    <button onClick={() => setShowVideoCallModal(false)}>Cancel</button>
  </div>
)}

    
    {/* Settings Dropdown */}
    {showSettings && (
      <div className="settings-dropdown">
        <label className="upload-label">
          Upload Profile Picture
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="upload-input"
          />
        </label>
        <button className="upload-button" onClick={uploadProfilePicture}>Upload</button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    )}
  </div>
      <aside className="employee-profile">
      {user?.profilePicture ? (
  <img 
    src={`http://localhost:5000${user.profilePicture}`} 
    alt="Profile" 
    width="150" 
    className="profile-picture" 
  />
) : (
  <p>No profile picture</p>
)}
  <h2>Welcome, {user.name || "User"}!</h2>
  <p>Role: {user.role || "Not specified"}</p>

  
</aside>



      <main className="task-section">
        <h1 className="dashboard-title">Task Manager</h1>

        {!showForm ? (
          <button className="add-task-toggle" onClick={() => setShowForm(true)}>
            Add Task
          </button>
        ) : (
          <form className="task-form" onSubmit={handleAddTask}>
            <label>Task Name:</label>
            <input
              type="text"
              name="name"
              value={taskData.name}
              onChange={handleInputChange}
              required
            />

            <label>Duration:</label>
            <input
              type="number"
              name="duration"
              value={taskData.duration}
              onChange={handleInputChange}
              required
            />

            <label>Unit:</label>
            <select name="unit" value={taskData.unit} onChange={handleInputChange}>
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>

            <label>Description:</label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
              required
            />

            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={taskData.startDate}
              onChange={handleInputChange}
              required
            />

            <label>End Date:</label>
            <input
              type="date"
              name="endDate"
              value={taskData.endDate}
              onChange={handleInputChange}
              required
            />

            <button type="submit" className="add-task-button">Add Task</button>
            <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}
        

        <section className="task-list">
          {tasks.length === 0 ? (
            <p>No tasks found</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="task-details">
                <h3>{task.name}</h3>
                <p><strong>Duration:</strong> {task.duration} {task.unit}</p>
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(task.endDate).toLocaleDateString()}</p>
                <p><strong>Time Left:</strong> {calculateTimeLeft(task.endDate)}</p>

                {/* PieChart for task progress */}
                <div className="task-chart">
                  <PieChart completedPercentage={taskCompletion[task._id]} />
                </div>

                {/* Slider to change completion percentage */}
                <div className="task-slider-container">
                <label>Adjust Completion: {taskCompletion[task._id]}%</label>
                <input
                type="range"
                min="0"
                max="100"
                value={taskCompletion[task._id]}
                onChange={(e) => handleCompletionChange(task._id, Number(e.target.value))}
      />
    </div>

                {/* Show/Hide Calendar Button */}
                <button className="delete-task-button" onClick={() => toggleCalendar(task._id)}>
                  {showCalendar[task._id] ? 'Hide Calendar' : 'Show Task Details'}
                </button>

                {showCalendar[task._id] && (
                  <Calendar
                  value={[new Date(task.startDate), new Date(task.endDate)]}
                  selectRange={true}
                  tileClassName={({ date }) => {
                    const startDate = new Date(task.startDate);
                    const endDate = new Date(task.endDate);
                
                    // Check if the current date matches the start or end date
                    if (date.toDateString() === startDate.toDateString()) {
                      return 'start-date-highlight';
                    }
                    if (date.toDateString() === endDate.toDateString()) {
                      return 'end-date-highlight';
                    }
                    return null;
                  }}
                />
                )}

                {/* Delete Task Button */}
                <button className="delete-task-button" onClick={() => handleDeleteTask(task._id)}>
                  Delete Task
                </button>
              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;

