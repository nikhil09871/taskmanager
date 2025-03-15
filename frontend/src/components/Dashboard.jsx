import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Dashboard.css';

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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);
  

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


  return (
    <div className="dashboard-container">
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

  <input type="file" accept="image/*" onChange={handleImageChange} />
  <button onClick={uploadProfilePicture}>Upload Picture</button>

  <button className="logout-button" onClick={handleLogout}>Logout</button>
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
      <div key={task._id} className="task-item">
        <h3>{task.name}</h3>
        <p>Duration: {task.duration} {task.unit}</p>
        <p>Description: {task.description}</p>
        <p>Start Date: {new Date(task.startDate).toLocaleDateString()}</p>
        <p>End Date: {new Date(task.endDate).toLocaleDateString()}</p>

        {/* Time left calculation */}
        <p>Time Left: {calculateTimeLeft(task.endDate)}</p>

        {/* Show/Hide Calendar Button */}
        <button onClick={() => toggleCalendar(task._id)}>
          {showCalendar[task._id] ? 'Hide Calendar' : 'Show Task Details'}
        </button>

        {showCalendar[task._id] && (
          <Calendar
            value={[new Date(task.startDate), new Date(task.endDate)]}
            selectRange={true}
            tileClassName={({ date }) =>
              date >= new Date(task.startDate) && date <= new Date(task.endDate)
                ? 'highlight'
                : null
            }
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




/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false); // Controls form visibility
  const [taskData, setTaskData] = useState({
    name: '',
    duration: '',
    unit: 'days',
    description: '',
    startDate: '',
    endDate: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('Unauthorized: Please log in again.');
      navigate('/login');
    } else {
      fetchTasks();
    }
  }, [token, navigate]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  // Handle task submission
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
      setShowForm(false); // Hide form after submission
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="employee-profile">
        <h2>Welcome to Your Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
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
              <div key={task._id} className="task-item">
                <h3>{task.name}</h3>
                <p>Duration: {task.duration} {task.unit}</p>
                <p>Description: {task.description}</p>
                <p>Start Date: {new Date(task.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(task.endDate).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;*/















/*test*/
/*const Dashboard = () => {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>You have successfully logged in!</p>
    </div>
  );
};

export default Dashboard;*/








/*
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "../styles/Dashboard.css";
import "react-calendar/dist/Calendar.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDuration, setTaskDuration] = useState("");
  const [taskUnit, setTaskUnit] = useState("days");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  const [employee, setEmployee] = useState({});
  const [showCalendar, setShowCalendar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("employeeData");
    if (data) {
      const parsedEmployee = JSON.parse(data);
      setEmployee(parsedEmployee);

      const storedTasks = localStorage.getItem(`tasks_${parsedEmployee.id}`);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks.map(task => ({ ...task, timeLeft: calculateTimeLeft(task.endDate) })));
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (employee.id) {
      localStorage.setItem(`tasks_${employee.id}`, JSON.stringify(tasks));
    }
  }, [tasks, employee.id]);

  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);

    if (end <= now) return "Time is up";

    const timeDifference = end - now;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          timeLeft: calculateTimeLeft(task.endDate),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    const newTask = {
      name: taskName,
      duration: taskDuration,
      unit: taskUnit,
      description: taskDescription,
      startDate: taskStartDate,
      endDate: taskEndDate,
      timeLeft: calculateTimeLeft(taskEndDate),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);

    setTaskName("");
    setTaskDuration("");
    setTaskUnit("days");
    setTaskDescription("");
    setTaskStartDate("");
    setTaskEndDate("");
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeData");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="employee-profile">
        <img src="/images/emp1.jpg" alt={employee.name} />
        <h2>{employee.name}</h2>
        <p>{employee.role}</p>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="task-section">
        <h2 className="dashboard-title">Employee Dashboard</h2>
        <button onClick={() => setShowForm(!showForm)} className="add-task-button">
          {showForm ? "Cancel" : "Add Task"}
        </button>

        {showForm && (
          <form onSubmit={handleAddTask} className="task-form">
            <input
              type="text"
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Task Duration"
              value={taskDuration}
              onChange={(e) => setTaskDuration(e.target.value)}
              required
            />
            <select value={taskUnit} onChange={(e) => setTaskUnit(e.target.value)}>
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>
            <textarea
              placeholder="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
            />
            <label>Start Date:</label>
            <input
              type="date"
              value={taskStartDate}
              onChange={(e) => setTaskStartDate(e.target.value)}
              required
            />
            <label>End Date:</label>
            <input
              type="date"
              value={taskEndDate}
              onChange={(e) => setTaskEndDate(e.target.value)}
              required
            />
            <button type="submit">Submit Task</button>
          </form>
        )}

        <div className="task-list">
          {tasks.map((task, index) => (
            <div key={index} className="task-item">
              <h3>{task.name}</h3>
              <p><strong>Duration:</strong> {task.duration} {task.unit}</p>
              <p><strong>Time Left:</strong> {task.timeLeft}</p>
              <p>{task.description}</p>
              <button onClick={() => setShowCalendar(showCalendar === index ? null : index)}>
                {showCalendar === index ? "Hide Calendar" : "Task Details"}
              </button>
              {showCalendar === index && (
                <div className="calendar-section">
                  <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {new Date(task.endDate).toLocaleDateString()}</p>
                  <Calendar
                    tileClassName={({ date }) => {
                      const taskStart = new Date(task.startDate).toDateString();
                      const taskEnd = new Date(task.endDate).toDateString();
                      const currentDate = date.toDateString();

                      if (currentDate === taskStart) return "start-date-highlight";
                      if (currentDate === taskEnd) return "end-date-highlight";
                      return null;
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;*/